// (C) 2007-2020 GoodData Corporation
/**
 * Return promise that will resolve after `ms` miliseconds
 *
 * @param ms - time in miliseconds
 * @returns
 */
export function delay(ms: number): Promise<void> {
    return new Promise((resolve: () => any) => {
        setTimeout(() => resolve(), ms);
    });
}
