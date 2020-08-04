// (C) 2007-2020 GoodData Corporation
/**
 * Return promise that will resolve after `ms` miliseconds
 *
 * @param {Number} ms time in miliseconds
 * @return {Promise}
 */
export function delay(ms: number): Promise<void> {
    return new Promise((resolve: () => any) => {
        setTimeout(() => resolve(), ms);
    });
}
