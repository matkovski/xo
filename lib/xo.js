export default class XO {
    static get blank() {
        return [
            ['', '', ''],
            ['', '', ''],
            ['', '', ''],
        ];
    }

    // could be cached i know
    get draw() {
        return this.position.flat().filter(c => !c).length === 0;
    }

    // could be cached i know
    get scores() {
        let winner = this.winner;
        if (winner === 'x') {
            return { x: 100, o: 0 };
        } else if (winner === 'o') {
            return { x: 0, o: 100 };
        }

        let scorex = 0;
        let scoreo = 0;
        this.position.forEach((row, y) => {
            row.forEach((c, x) => {
                let multiplier = (y === 0 || y === 2) && (x === 0 || x === 2) ? 1.5 : (x === 1 && y === 1 ? 2 : 0);
                if (c === 'x') {
                    scorex += multiplier;
                } else if (c === 'o') {
                    scoreo += multiplier;
                }
            });
        });

        return { x: scorex, o: scoreo };
    }

    // could be cached i know
    get winner() {
        let southeast = true;
        let southwest = true;
        for (let i = 0; i < 3; i ++) {
            let fullrow = true;
            let fullcol = true;
            for (let j = 0; j < 3; j ++) {
                fullrow = fullrow && !!this.position[i][j] && this.position[i][j] === this.position[i][0];
                fullcol = fullcol && !!this.position[j][i] && this.position[j][i] === this.position[0][i];
            }
            southeast = southeast && !!this.position[i][i] && this.position[i][i] === this.position[1][1];
            southwest = southwest && !!this.position[i][2 - i] && this.position[i][2 - i] === this.position[1][1];

            if (fullrow) {
                return this.position[i][0];
            }
            if (fullcol) {
                return this.position[0][i];
            }
        }

        return southeast || southwest ? this.position[1][1] : undefined;
    }

    constructor(position = undefined, turn = undefined) {
        position && this.validatePosition(position);
        this.position = position || XO.blank;
        this.turn = ['x', 'o'].includes(turn) ? turn : this.position.flat().filter(c => c).length % 2 ? 'o' : 'x'; // this else part is actually wrong (o could be the first to move), but a fallback as good as any
    }

    move(x, y) {
        if (!this.position) {
            throw new Error('No position to go from');
        }

        if (this.draw || this.winner) {
            throw new Error('Position is final');
        }

        if (this.validateMove(x, y)) {
            let next = this.position.map(row => row.slice());
            next[y][x] = this.turn;
            return new XO(next, this.turn === 'o' ? 'x' : 'o');
        }
    }

    validatePosition(position) {
        if (!Array.isArray(position)) {
            throw new Error('Raw position must be an array');
        }

        if (position.length !== 3 || position.some(r => !Array.isArray(r) || r.length !== 3)) {
            throw new Error('Malformed array given as position');
        }

        let flat = position.flat();
        if (flat.some(c => !['', 'x', 'o'].includes(c))) {
            throw new Error('Unexpected characters in position');
        }

        // this actually should also be taking this.turn into account - o could be first to move, in which case it may be 0 or -1, otherwise it's either 0 or 1
        let diff = Math.abs(flat.filter(c => c === 'x').length - flat.filter(c => c === 'o').length);
        if (diff !== 0 && diff !== 1) {
            throw new Error('Invalid position');
        }

        return true;
    }

    validateMove(x, y) {
        if (![0, 1, 2].includes(x) || ![0, 1, 2].includes(y)) {
            throw new Error('Out of range');
        }

        if (this.position[y][x]) {
            throw new Error('Cell ' + x + 'x' + y + ' is already taken');
        }

        return true;
    }
}