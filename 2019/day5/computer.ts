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

const enum Mode {
    POSITION = 0,
    IMMEDIATE
}

export class Computer {
    input: number;
    initialMemory: MemoryBank;
    runningMemory: MemoryBank;
    running: Boolean;
    debug: Boolean;

    constructor(memoryBank: MemoryBank, debug?: Boolean) {
        this.initialMemory = new MemoryBank(memoryBank.memory);
        this.running = true;
        this.debug = debug || false;
    }

    read(address: number, mode: Mode): number {
        return this.runningMemory.read(address, mode);
    }

    write(address: number, value: number, mode: Mode): void {
        return this.runningMemory.write(address, value, mode);
    }

    add(address: number, modes: Mode[]): number {
        let a = this.read(address++, modes[0]);
        let b = this.read(address++, modes[1]);
        this.write(address++, a + b, modes[2]);
        return address;
    }

    multiply(address: number, modes: Mode[]): number {
        let a = this.read(address++, modes[0]);
        let b = this.read(address++, modes[1]);
        this.write(address++, a * b, modes[2]);
        return address;
    }

    store(address: number, modes: Mode[]): number {
        this.write(address++, this.input, modes[0]);
        return address;
    }

    output(address: number, modes: Mode[]): number {
        console.log(this.read(address++, modes[0]));
        return address;
    }

    jumpIfTrue(address: number, modes: Mode[]): number {
        let test = this.read(address++, modes[0]);
        let jumpAddress = this.read(address++, modes[1]);
        return (test != 0) ? jumpAddress : address;
    }

    jumpIfFalse(address: number, modes: Mode[]): number {
        let test = this.read(address++, modes[0]);
        let jumpAddress = this.read(address++, modes[1]);
        return (test == 0) ? jumpAddress : address;
    }

    lessThan(address: number, modes: Mode[]): number {
        let a = this.read(address++, modes[0]);
        let b = this.read(address++, modes[1]);
        let where = this.read(address++, Mode.IMMEDIATE);
        let result = (a < b) ? 1 : 0;

        this.write(where, result, Mode.IMMEDIATE);
        return address;
    }

    equals(address: number, modes: Mode[]): number {
        let a = this.read(address++, modes[0]);
        let b = this.read(address++, modes[1]);
        let where = this.read(address++, Mode.IMMEDIATE);
        let result = (a == b) ? 1 : 0;

        this.write(where, result, Mode.IMMEDIATE);
        return address;
    }

    fetchInstruction(instrPtr: number): [ number, Mode[] ]{
        let rawOpCode = this.read(instrPtr, Mode.IMMEDIATE);
        let opCode = rawOpCode % 100;
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
        let instrMap = [ "noop", "add", "mul", "wri", "out", "jt", "jf", "lt", "eq" ]
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

        let instruction = this.fetchInstruction(instrPtr);
        instrPtr++;

        let opCode = instruction[0];
        let modes = instruction[1];

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
                instrPtr = this.output(instrPtr, modes);
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
                break;
        }

        return instrPtr;
    }

    patch(patchTuples: [number, number][]) {
        patchTuples.forEach(t => {
            this.write(t[0], t[1], Mode.IMMEDIATE);
        });
    }

    run(input: number, patches?: [number, number][]): void {

        this.input = input;
        this.runningMemory = new MemoryBank(this.initialMemory.memory);
        this.patch(patches || []);

        let instrPtr = 0;
        while (this.running) {
            instrPtr = this.executeInstruction(instrPtr);
        }
    }
}