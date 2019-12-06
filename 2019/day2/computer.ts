class Instruction {
    opCode: number;
    value1: number;
    value2: number;
    resultAddress: number;
}

export class MemoryBank {
    memory: number[];

    constructor(memory: number[]) {
        this.memory = [...memory];
    }
}

export class Computer {
    initialMemory: MemoryBank;
    instrSize: number = 4;

    opFnMap: ((a: number, b: number) => number)[] = [
        this.noop,
        this.add,
        this.multiply
    ];

    constructor(memoryBank: MemoryBank) {
        this.initialMemory = new MemoryBank(memoryBank.memory);
    }

    noop(a: number, b: number): number {
        return 0;
    }

    add(a: number, b: number): number {
        return a + b;
    }

    multiply(a: number, b: number): number {
        return a * b;
    }

    packInstruction(memoryBank: MemoryBank, instrPtr: number) : Instruction {
        const memory = memoryBank.memory;

        return {
            opCode: memory[instrPtr],
            value1: memory[memory[instrPtr + 1]],
            value2: memory[memory[instrPtr + 2]],
            resultAddress: memory[instrPtr + 3]
        };
    }

    run(noun: number, verb: number): number {

        let instrPtr = 0;
        let memoryBank = new MemoryBank(this.initialMemory.memory);

        memoryBank.memory[1] = noun;
        memoryBank.memory[2] = verb;

        while (true) {
            const instruction = this.packInstruction(memoryBank, instrPtr);

            if (instruction.opCode == 99) {
                return memoryBank.memory[0];
            }

            memoryBank.memory[instruction.resultAddress] = 
                    this.opFnMap[instruction.opCode](instruction.value1, instruction.value2);

            instrPtr += this.instrSize;
        }
    }
}