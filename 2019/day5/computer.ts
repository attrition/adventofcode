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

    opFnMap: ((address: number, modes: Mode[]) => number)[] = [
        this.noop,
        this.add,
        this.multiply,
        this.store,
        this.output
    ];

    constructor(memoryBank: MemoryBank) {
        this.initialMemory = new MemoryBank(memoryBank.memory);
        this.running = true;
    }

    read(address: number, mode: Mode): number {
        switch (mode) {
            case Mode.IMMEDIATE:
                return this.runningMemory[address];
            case Mode.POSITION:
                return this.runningMemory[this.runningMemory[address]];
        }
        return 0;
    }

    write(address: number, value: number, mode: Mode): void {
        switch (mode) {
            case Mode.IMMEDIATE:
                this.runningMemory[address] = value;
                break;
            case Mode.POSITION:
                this.runningMemory[this.runningMemory[address]] = value;
                break;
        }
    }

    noop(address: number, modes: Mode[]): number {
        return 0;
    }

    add(address: number, modes: Mode[]): number {
        let a = this.read(address, modes[0]);
        let b = this.read(address + 1, modes[1]);
        this.write(address + 2, a + b, modes[2]);
        return 3;
    }

    multiply(address: number, modes: Mode[]): number {
        let a = this.read(address, modes[0]);
        let b = this.read(address + 1, modes[1]);
        this.write(address + 2, a * b, modes[2]);
        return 3;
    }

    store(address: number, modes: Mode[]): number {
        return 0;
    }

    output(address: number, modes: Mode[]): number {
        return 0;
    }

    executeInstruction(instrPtr: number) {
        
        let opCode = this.runningMemory[instrPtr];
        let modes = [

        ];

        let instrSize = 0;

        switch (opCode) {
            case 1:
            case 2: {
                instrSize = this.opFnMap[opCode](instrPtr, modes);
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

        // increment instrPtr by opcode + paramSize
        return instrPtr + 1 + instrSize;
    }

    patch(patchTuples: [number, number][]) {
        patchTuples.forEach(t => {
            this.runningMemory.memory[t[0]] = t[1];
        });
    }

    run(input: number): number {

        this.input = input;
        this.runningMemory = new MemoryBank(this.initialMemory.memory);

        let instrPtr = 0;
        while (this.running) {
            instrPtr = this.executeInstruction(instrPtr);
        }

        return this.runningMemory.memory[0];
    }
}