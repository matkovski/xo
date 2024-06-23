import readline from 'node:readline';
import XO from '../lib/xo.js';

export default class Cli {
    constructor() {
        this.io = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
    }

    start() {
        this.game = new XO();
        this.stats = { x: 0, o: 0 };
        this.turn();
    }

    async turn() {
        console.clear(); // funny enough, readline can't do this

        this.render();

        if (this.game.winner || this.game.draw) {
            let message = this.game.winner ? this.game.winner.toUpperCase() + ' won!' : 'Draw!';

            this.io.question(message + ' Press enter to start a new round: ', input => {
                if (input === 'p') {
                    this.renderStats();
                } else {
                    this.game = new XO(undefined, this.game.winner === 'x' ? 'o' : 'x');
                    this.turn();
                }
            });

            return;
        }

        // iterate until we get a good move
        let errorMessage;
        while (true) {
            let [x, y] = await this.requestMove(errorMessage);
            errorMessage = undefined;
            try {
                this.game = this.game.move(x, y);
                let winner = this.game.winner;
                if (winner) {
                    this.stats[winner] ++;
                }
                break;
            } catch (e) {
                errorMessage = e.message + '. Try again (x:y or xy): ';
            }
        }

        this.turn();
    }

    requestMove(prompt = undefined) {
        return new Promise(resolve => {
            this.io.question(prompt || this.game.turn.toUpperCase() + ' to move (x:y or xy): ', input => {
                if (input === 'p') {
                    this.renderStats();
                    return;
                }

                let match = input.match(/^([012]):?([012])$/);
                if (!match) {
                    this.requestMove('Please enter move as x:y, where both x and y are 0 to 2').then(resolve);
                } else {
                    let x = parseInt(match[1], 10);
                    let y = parseInt(match[2], 10);
                    resolve([x, y]);
                }
            });
        })
    }

    render() {
        let board = this.game.position.reduce((all, row) => {
            all.push(row.map(c => ' ' + (c || ' ') + ' ').join('|'));
            return all;
        }, []).join('\n-----------\n').toUpperCase();
        
        this.io.write(board + '\n');
    }

    async renderStats() {
        console.clear();
        this.io.question('Stats:\n' +
            'X wins: ' + this.stats.x + '\n' +
            'O wins: ' + this.stats.o + '\n' +
            '\n' +
            'Press enter to continue: ',
            () => this.turn()
        );        
    }
}