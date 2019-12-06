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

            let alwaysIncreases = ((password: string): Boolean => {
                for (let i = 0; i < password.length - 1; ++i) {
                    if (Number.parseInt(password[i]) > Number.parseInt(password[i + 1])) {
                        return false;
                    }
                }
                return true;
            })(password); 

            return (alwaysIncreases && ((password: string): Boolean => {
                let prev = Number.parseInt(password[0]);
                let adjCount = 1;

                for (let i = 1; i < password.length; i++) {
                    let curr = Number.parseInt(password[i]);
                    if (curr == prev) {
                        adjCount++;
                    } else {
                        if (adjCount == 2) {
                            return true;
                        }
                        adjCount = 1;
                    }
                    prev = curr;
                }
                return (adjCount == 2)
            })(password));
        }

        for (let num = numStart; num <= numEnd; ++num) {
            count += (validPassword(num.toString()) ? 1 : 0);
        }

        return count;
    })(start, end));

}
