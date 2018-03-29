/**
 * Return promise that will resolve after `ms` miliseconds
 *
 * @param {Number} ms time in miliseconds
 * @return {Promise}
 */
export function delay(ms: number) {
    return new Promise((resolve: Function) => {
        setTimeout(() => resolve(), ms);
    });
}
