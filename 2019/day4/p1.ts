namespace day4 {

    // exact range: 387638 -> 919123
    let input = "387638-919123".split("-");
    let start = input[0];
    let end = input[1];

    console.log(((start: string, end: string): number => {
        const numStart = Number.parseInt(start);
        const numEnd = Number.parseInt(end);

        let count = 0;

        let validPassword = (password: string): Boolean => {
            let alwaysIncreases = true;
            let adjacencyMet = false;

            for (let i = 0; i < password.length - 1; ++i) {
                let num = Number.parseInt(password[i]);
                let nextNum = Number.parseInt(password[i + 1]); 

                if (num == nextNum) {
                    adjacencyMet = true;
                }
                if (nextNum < num) {
                    alwaysIncreases = false;
                    break;
                }
            }

            return (alwaysIncreases && adjacencyMet);
        }

        for (let num = numStart; num <= numEnd; ++num) {
            count += (validPassword(num.toString()) ? 1 : 0);
        }

        return count;
    })(start, end));

}