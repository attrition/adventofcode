export class MemoryBank {
    memory: number[];

    constructor(memory: number[]) {
        this.memory = [...memory];
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
    
    constructor(memoryBank: MemoryBank) {
        this.initialMemory = new MemoryBank(memoryBank.memory);
        this.running = true;
    }

    read(address: number, mode: Mode): number {
        switch (mode) {
            case Mode.POSITION:
                return this.runningMemory.memory[this.runningMemory.memory[address]];
            case Mode.IMMEDIATE:
                return this.runningMemory.memory[address];
        }
        return 0;
    }

    write(address: number, value: number, mode: Mode): void {
        switch (mode) {
            case Mode.POSITION:
                this.runningMemory[this.runningMemory[address]] = value;
                break;
            case Mode.IMMEDIATE:
                this.runningMemory[address] = value;
                break;
        }
    }

    add(address: number, modes: Mode[]): number {
        let a = this.read(address + 1, modes[0]);
        let b = this.read(address + 2, modes[1]);
        this.write(address + 3, a + b, modes[2]);
        return 3;
    }

    multiply(address: number, modes: Mode[]): number {
        let a = this.read(address + 1, modes[0]);
        let b = this.read(address + 2, modes[1]);
        this.write(address + 3, a * b, modes[2]);
        return 3;
    }

    store(address: number, modes: Mode[]): number {
        return 0;
    }

    output(address: number, modes: Mode[]): number {
        return 0;
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

    executeInstruction(instrPtr: number) {

        let instruction = this.fetchInstruction(instrPtr);
        let opCode = instruction[0];
        let modes = instruction[1];

        let instrSize = 0;

        switch (opCode) {
            case 1: {
                instrSize = this.add(instrPtr, modes);
                break;
            }

            case 2: {
                instrSize = this.multiply(instrPtr, modes);
                break;
            }

            case 3: {
                break;
            }

            case 4: {
                break;
            }

            case 99: {
                this.running = false;
                break;
            }
        }

        // increment instrPtr by opcode + instruction size
        return instrPtr + 1 + instrSize;
    }

    patch(patchTuples: [number, number][]) {
        patchTuples.forEach(t => {
            this.runningMemory.memory[t[0]] = t[1];
        });
    }

    run(input: number, patches: [number, number][]): number {

        this.input = input;
        this.runningMemory = new MemoryBank(this.initialMemory.memory);
        this.patch(patches || []);

        let instrPtr = 0;
        while (this.running) {
            instrPtr = this.executeInstruction(instrPtr);
        }

        return this.runningMemory.memory[0];
    }
}