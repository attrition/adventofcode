import * as IntCode from "./computer";

// [
//     new IntCode.Test([3,15,3,16,1002,16,10,16,1,16,15,15,4,15,99,0,0], [4,3,2,1,0], 43210),
//     new IntCode.Test([3,23,3,24,1002,24,10,24,1002,23,-1,23,
//         101,5,23,23,1,24,23,23,4,23,99,0,0], [0,1,2,3,4], 54321)
// ].forEach(t => {
//     t.run(false);
// });

let memory = [
//3,8,1001,8,10,8,105,1,0,0,21,42,67,84,109,122,203,284,365,446,99999,3,9,1002,9,3,9,1001,9,5,9,102,4,9,9,1001,9,3,9,4,9,99,3,9,1001,9,5,9,1002,9,3,9,1001,9,4,9,102,3,9,9,101,3,9,9,4,9,99,3,9,101,5,9,9,1002,9,3,9,101,5,9,9,4,9,99,3,9,102,5,9,9,101,5,9,9,102,3,9,9,101,3,9,9,102,2,9,9,4,9,99,3,9,101,2,9,9,1002,9,3,9,4,9,99,3,9,101,2,9,9,4,9,3,9,101,1,9,9,4,9,3,9,101,1,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,101,1,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,1002,9,2,9,4,9,3,9,1001,9,2,9,4,9,3,9,101,1,9,9,4,9,3,9,1002,9,2,9,4,9,99,3,9,1001,9,1,9,4,9,3,9,101,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,101,1,9,9,4,9,3,9,102,2,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,101,1,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,2,9,9,4,9,3,9,1002,9,2,9,4,9,99,3,9,101,2,9,9,4,9,3,9,101,2,9,9,4,9,3,9,101,2,9,9,4,9,3,9,101,1,9,9,4,9,3,9,101,1,9,9,4,9,3,9,102,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,2,9,9,4,9,3,9,1001,9,1,9,4,9,99,3,9,1001,9,1,9,4,9,3,9,101,1,9,9,4,9,3,9,102,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,1001,9,2,9,4,9,3,9,1001,9,1,9,4,9,3,9,1001,9,2,9,4,9,3,9,1002,9,2,9,4,9,3,9,1002,9,2,9,4,9,3,9,102,2,9,9,4,9,99,3,9,102,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,2,9,9,4,9,3,9,101,2,9,9,4,9,3,9,101,1,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,1,9,9,4,9,3,9,1001,9,2,9,4,9,3,9,102,2,9,9,4,9,3,9,101,1,9,9,4,9,99
3,26,1001,26,-4,26,3,27,1002,27,2,27,1,27,26,27,4,27,1001,28,-1,28,1005,28,6,99,0,0,5
];

let largestSignal = Number.MIN_SAFE_INTEGER;

((inputs: number[]): number[][] => {

    function p(inputs: number[], temp: number[]): void {
        let i: number;
        let x: number;
        if (!inputs.length) {
            result.push(temp);
        }
        for (i = 0; i < inputs.length; i++) {
            x = inputs.splice(i, 1)[0];
            p(inputs, temp.concat(x));
            inputs.splice(i, 0, x);
        }
    }

    let result = [];
    p(inputs, []);
    return result;
})([5,6,7,8,9]).forEach(arr => {
    let result: number = 0;
    let finished: boolean = false;

    let amplifiers = [
        new IntCode.Computer(new IntCode.MemoryBank(memory), true, true),
        new IntCode.Computer(new IntCode.MemoryBank(memory), true, true),
        new IntCode.Computer(new IntCode.MemoryBank(memory), true, true),
        new IntCode.Computer(new IntCode.MemoryBank(memory), true, true),
        new IntCode.Computer(new IntCode.MemoryBank(memory), true, true)
    ];

    while (!finished) {
        arr.forEach((input, idx) => {
            result = amplifiers[idx].run([input, result]);
        });
        finished = amplifiers[4].finished;
    }

    if (result > largestSignal) {
        largestSignal = result;
    }
});

console.log("largestSignal:", largestSignal);

