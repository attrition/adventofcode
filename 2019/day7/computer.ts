export class MemoryBank {
    memory: number[];

    constructor(memory: number[]) {
        this.memory = [...memory];
    }
    
    read(address: number, mode: Mode): number {
        switch (mode) {
            case Mode.POSITION:
                return this.memory[this.memory[address]];
            case Mode.IMMEDIATE:
                return this.memory[address];
        }
        return 0;
    }
    
    write(address: number, value: number, mode: Mode): void {
        switch (mode) {
            case Mode.POSITION:
                this.memory[this.memory[address]] = value;
                break;
            case Mode.IMMEDIATE:
                this.memory[address] = value;
                break;
        }
    }
}

export class Test {
    memory: MemoryBank;
    patches: [number, number][];
    inputs: number[];
    output: number;

    constructor(memory: number[], inputs: number[], output: number, patches?: [number, number][]) {
        this.memory = new MemoryBank(memory);
        this.patches = patches || [];
        this.inputs = [...inputs];
        this.output = output;
    }

    run(debug: boolean) {
        let computer = new Computer(this.memory, debug);
        let result = 0;
        console.log("[TEST] inputs: " + this.inputs + " | expected: " + this.output);

        this.inputs.forEach(input => {
            result = computer.run([input, result], this.patches);
        });

        console.log((result == this.output) ? "PASS" : "FAIL: result was", result);
    }
}

const enum Mode {
    POSITION = 0,
    IMMEDIATE
}

export class Computer {
    inputs: number[];
    output: number;
    initialMemory: MemoryBank;
    runningMemory: MemoryBank;
    running: boolean;
    debug: boolean;
    instrPtr: number;
    feedback: boolean;
    finished: boolean;

    constructor(memoryBank: MemoryBank, debug?: boolean, feedback?: boolean) {
        this.initialMemory = new MemoryBank(memoryBank.memory);
        this.runningMemory = new MemoryBank(memoryBank.memory);
        this.running = true;
        this.debug = debug || false;
        this.instrPtr = 0;
        this.feedback = feedback || false;
        this.finished = false;
    }

    read(address: number, mode: Mode): number {
        return this.runningMemory.read(address, mode);
    }

    write(address: number, value: number, mode: Mode): void {
        return this.runningMemory.write(address, value, mode);
    }

    add(address: number, modes: Mode[]): number {
        const a = this.read(address++, modes[0]);
        const b = this.read(address++, modes[1]);
        this.write(address++, a + b, modes[2]);
        return address;
    }

    multiply(address: number, modes: Mode[]): number {
        const a = this.read(address++, modes[0]);
        const b = this.read(address++, modes[1]);
        this.write(address++, a * b, modes[2]);
        return address;
    }

    store(address: number, modes: Mode[]): number {
        this.write(address++, this.inputs.shift(), modes[0]);
        return address;
    }

    result(address: number, modes: Mode[]): number {
        this.output = this.read(address++, modes[0]);
        if (this.debug) {
            console.log("output:", this.output);
        }
        if (this.feedback) {
            this.running = false;
        }
        return address;
    }

    jumpIfTrue(address: number, modes: Mode[]): number {
        const test = this.read(address++, modes[0]);
        const jumpAddress = this.read(address++, modes[1]);
        return (test != 0) ? jumpAddress : address;
    }

    jumpIfFalse(address: number, modes: Mode[]): number {
        const test = this.read(address++, modes[0]);
        const jumpAddress = this.read(address++, modes[1]);
        return (test == 0) ? jumpAddress : address;
    }

    lessThan(address: number, modes: Mode[]): number {
        const a = this.read(address++, modes[0]);
        const b = this.read(address++, modes[1]);
        const where = this.read(address++, Mode.IMMEDIATE);
        const result = (a < b) ? 1 : 0;

        this.write(where, result, Mode.IMMEDIATE);
        return address;
    }

    equals(address: number, modes: Mode[]): number {
        const a = this.read(address++, modes[0]);
        const b = this.read(address++, modes[1]);
        const where = this.read(address++, Mode.IMMEDIATE);
        const result = (a == b) ? 1 : 0;

        this.write(where, result, Mode.IMMEDIATE);
        return address;
    }

    fetchInstruction(instrPtr: number): [ number, Mode[] ]{
        let rawOpCode = this.read(instrPtr, Mode.IMMEDIATE);
        const opCode = rawOpCode % 100;
        let modes: Mode[] = [];

        // I just didn't want to use strings
        let test = 10000;
        while (test >= 100) {
            let bitset = (Math.floor(rawOpCode / test) == 1) ?
                    Mode.IMMEDIATE : Mode.POSITION;
            modes.unshift(bitset);
            if (bitset == Mode.IMMEDIATE) {
                rawOpCode -= test;
            }
            test /= 10;
        }
        return [ opCode, modes ];
    }

    debugRunningMemory(instrPtr: number): void {
        const instrMap = [ "noop", "add", "mul", "wri", "out", "jt", "jf", "lt", "eq" ]
        let debug = "";
        for (let i = 0; i < this.runningMemory.memory.length; ++i) {
            let mem = this.runningMemory.memory[i] % 100;
            if (instrPtr == i) {
                debug += "*" + (instrMap[mem] || mem) + "*";
            }  else {
                debug += this.runningMemory.memory[i];
            }
            if (i != this.runningMemory.memory.length - 1) { debug += "\t"; }
        }
        console.log(debug);
    }

    executeInstruction(instrPtr: number): number {

        if (this.debug) {
            this.debugRunningMemory(instrPtr);
        }

        const instruction = this.fetchInstruction(instrPtr);
        instrPtr++;

        const opCode = instruction[0];
        const modes = instruction[1];

        switch (opCode) {
            case 1:
                instrPtr = this.add(instrPtr, modes);
                break;

            case 2:
                instrPtr = this.multiply(instrPtr, modes);
                break;

            case 3:
                instrPtr = this.store(instrPtr, modes);
                break;

            case 4:
                instrPtr = this.result(instrPtr, modes);
                break;
            
            case 5:
                instrPtr = this.jumpIfTrue(instrPtr, modes);
                break;

            case 6:
                instrPtr = this.jumpIfFalse(instrPtr, modes);
                break;

            case 7:
                instrPtr = this.lessThan(instrPtr, modes);
                break;

            case 8:
                instrPtr = this.equals(instrPtr, modes);
                break;

            case 99:
                this.running = false;
                this.finished = true;
                break;
        }

        return instrPtr;
    }

    patch(patchTuples: [number, number][]) {
        patchTuples.forEach(t => {
            this.write(t[0], t[1], Mode.IMMEDIATE);
        });
    }

    initialize(inputs: number[], patches: [number, number][]): void {
        this.inputs = [...inputs];
        if (!this.feedback) {
            this.runningMemory = new MemoryBank(this.initialMemory.memory);
            this.instrPtr = 0;
            this.finished = false;
        }
        this.patch(patches);
        this.running = true;

        if (this.debug) {
            console.log("running with inputs:", this.inputs);
        }
    }

    run(inputs: number[], patches?: [number, number][]): number {
        this.initialize(inputs, patches || []);

        while (this.running && !this.finished) {
            this.instrPtr = this.executeInstruction(this.instrPtr);
        }

        return this.output;
    }
}