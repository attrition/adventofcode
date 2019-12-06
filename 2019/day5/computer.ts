export class MemoryBank {
    memory: number[];

    constructor(memory: number[]) {
        this.memory = [...memory];
    }
}

export class Computer {
    input: number;
    initialMemory: MemoryBank;
    runningMemory: MemoryBank;
    running: Boolean;

    opFnMap: ((params: number[]) => number)[] = [
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

    noop(params: number[]): number {
        return 0;
    }

    add(params: number[]): number {
        return params[0] + params[1];
    }

    multiply(params: number[]): number {
        return params[0] * params[1];
    }

    store(params: number[]): number {
        return params[0];
    }

    output(params: number[]): number {
        return params[0];
    }

    executeInstruction(instrPtr: number) {
        const memory = this.runningMemory.memory;

        let opCode = memory[instrPtr];
        let params = [];

        switch (opCode) {
            case 1:
            case 2:
                params = [
                    memory[memory[instrPtr + 1]],
                    memory[memory[instrPtr + 2]],
                    memory[instrPtr + 3]
                ];
                memory[params[2]] = this.opFnMap[opCode](params);
                break;

            case 3:
                params = [ this.input ];
                memory[memory[instrPtr + 1]] = this.opFnMap[opCode](params);
                break;

            case 4: {
                params = [ memory[memory[instrPtr + 1]] ];
                let output = this.opFnMap[opCode](params);
                break;
            }

            case 99:
                this.running = false;
                break;
        }

        // increment instrPtr by opcode + paramSize
        return instrPtr + 1 + params.length;
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