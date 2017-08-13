'use strict';

module.exports.consume = function consume(queue, n, handler) {
    let ok = true;

    return Promise
        .all(Array(n).fill().map(() => makePromise()))
        .then(results => [].concat(...results));

    function makePromise(results = []) {
        if (ok && queue.length > 0) {
            let data = queue.shift();
            return new Promise((resolve, reject) => {
                handler({
                    data,
                    resolve: value => {
                        resolve(results.concat(value));
                    },
                    reject: error => {
                        ok = false;
                        reject(error);
                    }
                });
            }).then(value => makePromise(value));
        }
        return results;
    }
};
