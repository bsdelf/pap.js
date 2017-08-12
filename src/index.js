'use strict';

module.exports.consume = function consume(queue, n, handler) {
    let ok = true;

    return Promise
        .all(Array(n).fill().map(() => makePromise()))
        .then(value => [].concat(...value));

    function makePromise(results = []) {
        if (ok && queue.length > 0) {
            let data = queue.shift();
            return new Promise((resolve, reject) => {
                handler({
                    data,
                    resolve: value => {
                        results.push(value);
                        resolve(makePromise(results));
                    },
                    reject: error => {
                        ok = false;
                        reject(error);
                    }
                });
            });
        }
        return Promise.resolve(results);
    }
};
