import {it, describe} from 'mocha';
import assert from 'assert';
import path from 'path';
import child from 'child_process';

let cmd = path.join(process.cwd(), 'index.js');

async function read(prc) {
    return new Promise(resolve => {
        prc.stdout.once('data', raw => resolve(raw.toString('utf-8')));
    });
}

describe('CLI', () => {
    it('play a good game', async () => {
        let prc = child.spawn(cmd, { stdio: 'pipe' });
        let output;
        
        output = await read(prc);
        assert.match(output, /X to move/);
        
        prc.stdin.write('00\n');
        output = await read(prc);
        assert.match(output, /O to move/);
        
        prc.stdin.write('10\n');
        output = await read(prc);
        assert.match(output, /X to move/);
        
        prc.stdin.write('0:1\n');
        output = await read(prc);
        assert.match(output, /O to move/);
        
        prc.stdin.write('1:1\n');
        output = await read(prc);
        assert.match(output, /X to move/);
        
        prc.stdin.write('02\n');
        output = await read(prc);
        assert.match(output, /X won\!/);
        
        prc.kill();

        // not going to test all good cases, it's all covered in xo.test.js
    });

    it('play a bad game', async () => {
        let prc = child.spawn(cmd, { stdio: 'pipe' });
        let output;

        output = await read(prc);
        assert.match(output, /X to move/);

        prc.stdin.write('hello computer\n');
        output = await read(prc);
        assert.match(output, /Please enter move as x:y, where both x and y are 0 to 2/);
        
        prc.stdin.write('03\n');
        output = await read(prc);
        assert.match(output, /Please enter move as x:y, where both x and y are 0 to 2/);
        
        prc.stdin.write('00\n');
        output = await read(prc);
        assert.match(output, /O to move/);
        prc.stdin.write('00\n');
        output = await read(prc);
        assert.match(output, /Cell 0x0 is already taken/);
        prc.stdin.write('00\n');
        output = await read(prc);
        assert.match(output, /Cell 0x0 is already taken/);
        
        prc.kill();

        // not going to test all good cases, it's all covered in xo.test.js
    });

    it('check stats', async () => {
        let prc = child.spawn(cmd, { stdio: 'pipe' });
        let output;

        output = await read(prc);
        prc.stdin.write('p\n');
        output = await read(prc);
        assert.match(output, /X wins: 0/m);
        assert.match(output, /O wins: 0/m);

        prc.stdin.write('\n');
        await read(prc);
        
        prc.stdin.write('00\n');
        await read(prc);
        prc.stdin.write('10\n');
        await read(prc);
        prc.stdin.write('01\n');
        await read(prc);
        prc.stdin.write('11\n');
        await read(prc);
        prc.stdin.write('02\n');
        output = await read(prc);
        assert.match(output, /X won\!/);
        
        prc.stdin.write('p\n');
        output = await read(prc);
        assert.match(output, /X wins: 1/m);
        assert.match(output, /O wins: 0/m);

        prc.kill();
    });
});