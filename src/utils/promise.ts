// (C) 2007-2018 GoodData Corporation
/**
 * Return promise that will resolve after `ms` miliseconds
 *
 * @param {Number} ms time in miliseconds
 * @return {Promise}
 */
export function delay(ms: number) {
    return new Promise((resolve: () => any) => {
        setTimeout(() => resolve(), ms);
    });
}
