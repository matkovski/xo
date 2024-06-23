import {it, describe} from 'mocha';
import assert from 'assert';

import XO from '../lib/xo.js';

describe('XO', () => {
    it('constructing empty', () => {
        let xo = new XO();
        assert.equal(xo.position.flat().length, 9);
        assert.equal(xo.position.flat().join(''), '');
        assert.equal(xo.turn, 'x');
    });

    it('constructing non-empty', () => {
        let xo = new XO([['','',''],['','x',''],['','','']]);
        assert.equal(xo.turn, 'o');

        xo = new XO(undefined, 'o');
        assert.equal(xo.position.flat().length, 9);
        assert.equal(xo.position.flat().join(''), '');
        assert.equal(xo.turn, 'o');
    });

    it('constructing bad non-empty', () => {
        assert.throws(() => new XO('Hello worlds'));
        assert.throws(() => new XO(12344));
        assert.throws(() => new XO({game: 'chess'}));
        assert.throws(() => new XO(['a','b','c']));
        assert.throws(() => new XO([['', '', 'a'], ['', 'X', ''], [0, 0, 0]]));
        assert.throws(() => new XO([['x', 'x', 'x'], ['', '', ''], ['', '', '']]));
    });

    it('making good moves', () => {
        let xo = new XO();
        xo = xo.move(1, 1);
        assert.equal(xo.position[1][1], 'x');
        assert.equal(xo.turn, 'o');
        xo = xo.move(0, 0);
        assert.equal(xo.position[0][0], 'o');
        assert.equal(xo.turn, 'x');

        xo = new XO([['o', 'x', ''], ['o', 'x', ''], ['', '', '']], 'o');
        xo = xo.move(0, 2);
        assert.equal(xo.winner, 'o');
        assert.equal(xo.draw, false);
        assert.equal(xo.scores.o, 100);

        xo = new XO([['o', 'x', 'o'], ['o', 'x', 'x'], ['x', 'o', '']], 'o');
        xo = xo.move(2, 2);
        assert.equal(xo.draw, true);
    });

    it('making bad moves', () => {
        let xo = new XO();
        assert.throws(() => xo.move());
        assert.throws(() => xo.move('bad', 'move'));
        assert.throws(() => xo.move(Infinity, NaN));
        assert.throws(() => xo.move(-1, 0));
        assert.throws(() => xo.move(4, 1));
        
        xo = xo.move(1, 1);
        assert.throws(() => xo.move(1, 1));

        xo = new XO([['x', 'o', ''], ['x', 'o', ''], ['x', '', '']]);
        assert.equal(xo.winner, 'x');
        assert.throws(() => xo.move(2, 1));
    });
});
