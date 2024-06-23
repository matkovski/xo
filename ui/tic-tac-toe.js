import XO from '../lib/xo.js';
import computer from '../lib/computer.js';

let template = `
    <div class="board">
        <div class="row">
            <a class="cell" data-x="0" data-y="0"></a>
            <a class="cell" data-x="1" data-y="0"></a>
            <a class="cell" data-x="2" data-y="0"></a>
        </div>
        <div class="row">
            <a class="cell" data-x="0" data-y="1"></a>
            <a class="cell" data-x="1" data-y="1"></a>
            <a class="cell" data-x="2" data-y="1"></a>
        </div>
        <div class="row">
            <a class="cell" data-x="0" data-y="2"></a>
            <a class="cell" data-x="1" data-y="2"></a>
            <a class="cell" data-x="2" data-y="2"></a>
        </div>
    </div>
    <div class="tools">
        <div class="message"></div>
        <a class="player-toggle for-x">X is mouse player</a>
        <a class="player-toggle for-o">O is mouse player</a>
        <div class="scores">
            <span class="x">0</span>
            :
            <span class="o">0</span>
        </div>
    </div>
`;

class TicTacToe extends HTMLElement {
    connectedCallback() {
        // might have put all of this into a shadow but why

        this.innerHTML = template;

        this.cells = Array.from(this.querySelectorAll('.cell')).reduce((all, cell) => {
            let x = parseInt(cell.getAttribute('data-x'));
            let y = parseInt(cell.getAttribute('data-y'));
            all[y][x] = cell;
            return all;
        }, [[], [], []]);

        this.scoreX = this.querySelector('.scores .x');
        this.scoreO = this.querySelector('.scores .o');

        this.querySelectorAll('.player-toggle').forEach(toggle => {
            toggle.addEventListener('click', () => this.switchPlayer(toggle));
        })

        this.message = this.querySelector('.message');

        this.game = new XO();
        this.scores = { x: 0, o: 0 };

        // players are just async functions which get game as argument and resolve to [x, y] - in ts i'd have an interface but i can't be bothered to use ts for this
        this.players = {
            x: this.getMove.bind(this),
            o: this.getMove.bind(this),
        };

        this.turn();
    }

    switchPlayer(toggle) {
        let which = toggle.classList.contains('for-x') ? 'x' : 'o';
        if (this.players[which] === computer) {
            this.players[which] = this.getMove.bind(this);
            toggle.innerText = which.toUpperCase() + ' is mouse player';
        } else {
            this.players[which] = computer;
            toggle.innerText = which.toUpperCase() + ' is computer';
        }
        if (this.game.turn === which && this.moveResolve) {
            this.players[this.game.turn](this.game).then(this.moveResolve);
        }
    }

    async turn() {
        this.render();

        if (this.game.winner || this.game.draw) {
            if (this.game.winner) {
                this.prompt(this.game.winner.toUpperCase() + ' won!')
            } else if (this.game.draw) {
                this.prompt('Draw!')
            }
            await this.clickAnywhere();
            this.game = new XO(undefined, this.game.winner === 'x' ? 'o' : 'x');
        } else {
            this.prompt(this.game.turn.toUpperCase() + ' to move');
            // let [x, y] = await this.players[this.game.turn](this.game);
            let [x, y] = await this.requestMove();
            try {
                this.game = this.game.move(x, y);
                let winner = this.game.winner;
                if (winner) {
                    this.scores[winner] ++;
                }
            } catch (e) {
                this.prompt(e.message);
            }
        }
        this.turn();
    }

    requestMove() {
        return new Promise(resolve => {
            this.moveResolve = resolve;
            this.players[this.game.turn](this.game).then(resolve);
        });
    }

    async clickAnywhere() {
        return new Promise(resolve => {
            this.addEventListener('click', resolve, { once: true });
        });
    }

    render() {
        this.classList.toggle('game-end', this.game.winner || this.game.draw);
        this.game.position.forEach((row, y) => {
            row.forEach((cell, x) => {
                this.cells[y][x].classList.toggle('x', cell === 'x');
                this.cells[y][x].classList.toggle('o', cell === 'o');
            });
        });
        this.scoreX.innerText = this.scores.x;
        this.scoreO.innerText = this.scores.o;
    }

    prompt(message) {
        this.message.innerText = message;
    }

    async getMove(game) {
        return new Promise(resolve => {
            let click = event => {
                if (event.target?.classList.contains('cell') && !event.target.classList.contains('x') && !event.target.classList.contains('o')) {
                    this.removeEventListener('click', click);
                    let x = parseInt(event.target.getAttribute('data-x'));
                    let y = parseInt(event.target.getAttribute('data-y'));
                    resolve([x, y]);
                }
            }

            this.addEventListener('click', click);
        });
    }
}

customElements.define('tic-tac-toe', TicTacToe);
