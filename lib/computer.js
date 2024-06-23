export default async function computer(game) {
    let maxscore;
    let goodmoves = [];
    let turn = game.turn;
    let other = turn === 'x' ? 'o' : 'x';
    for (let y = 0; y < 3; y ++) {
        for (let x = 0; x < 3; x ++) {
            if (!game.position[y][x]) {
                let first = game.move(x, y);
                let winner = first.winner;
                if (winner === turn) {
                    return [x, y];
                } else if (winner === other) {
                    continue;
                }

                let score = first.scores[turn];
                if (!maxscore || maxscore < score) {
                    // if this is the last move of the game, the next loop will produce nothing, so at least we have one move to return,
                    // also, in case we can win next move, we'll stop chasing the opponent and just go win
                    maxscore = score;
                    goodmoves = [[x, y]];
                }

                for (let yy = 0; yy < 3; yy ++) {
                    for (let xx = 0; xx < 3; xx ++) {
                        if (!first.position[yy][xx]) {
                            let second = first.move(xx, yy);
                            let score = second.scores[other];
                            if (!maxscore || maxscore < score) {
                                maxscore = score;
                                goodmoves = [[xx, yy]];
                            } else if (maxscore === score) {
                                goodmoves.push([xx, yy]);
                            }
                        }
                    }
                }
            }
        }
    }

    return goodmoves[Math.floor(Math.random() * goodmoves.length)];
}
