/**
 * Return promise that will resolve after `ms` miliseconds
 *
 * @param {Number} ms time in miliseconds
 * @return {Promise}
 */
export function delay(ms) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), ms);
    });
}
