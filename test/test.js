/* global describe it */
'use strict';

const { assert } = require('chai');
const PAP = require('../');

const k = 20;
const genSeq = () => Array(k).fill(1).map((val, idx) => val + idx);
const cmpNum = (a, b) => a - b;

describe('PAP', () => {
    describe('#consume()', () => {
        const genCase = cmd => n => done => {
            PAP
                .consume(genSeq(), n, ctx => {
                    cmd(ctx);
                })
                .then(value => {
                    assert.deepEqual(value.sort(cmpNum), genSeq());
                    done();
                })
                .catch(error => {
                    done(error);
                });
        };

        const cmds = {
            sync: ({ resolve, data }) => {
                resolve(data);
            },
            async: ({ resolve, data }) => {
                setTimeout(() => {
                    resolve(data);
                }, 1);
            }
        };

        ['sync', 'async']
            .forEach(ver => {
                [['1:n', 1], ['m:n', k / 2], ['m:m', k], ['n:m', k * 2]]
                    .forEach(([txt, n]) => {
                        it(`${txt} ${ver}`, genCase(cmds[ver])(n));
                    });
            });

        it('should catch on rejection', done => {
            const theError = new Error('the error');

            PAP
                .consume(genSeq(), 1, ({ reject }) => {
                    reject(theError);
                })
                .catch(error => {
                    assert.deepEqual(error, theError);
                    done();
                })
                .catch(error => {
                    done(error);
                });
        });

        it('should stop on rejection', done => {
            const theError = new Error(k / 2);

            PAP
                .consume(genSeq(), k / 2, ({ data, resolve, reject }) => {
                    if (data < k / 2) {
                        resolve(data);
                    } else {
                        reject(new Error(data));
                    }
                })
                .catch(error => {
                    assert.strictEqual(error.toString(), theError.toString());
                    done();
                })
                .catch(error => {
                    done(error);
                });
        });
    });
});
