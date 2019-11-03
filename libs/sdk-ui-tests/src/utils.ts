// (C) 2007-2019 GoodData Corporation

import cloneDeepWith = require("lodash/cloneDeepWith");
import isFunction = require("lodash/isFunction");
import isObject = require("lodash/isObject");
import omit = require("lodash/omit");

/**
 * Cleans up properties before taking their snapshot. The goal of this function is to remove any properties
 * that are not significant for the snapshot testing. For instance:
 *
 * -  completely remove the 'backend' prop
 * -  clean up functions from prepared execution stored in 'execution' prop
 *
 * @param props - props to clean up
 * @param omitKeys - keys to completely remove from the props; defaults to omiting the 'backend' prop
 * @param cleanupFuns - keys whose values are objects that should be cleaned from any props that contain functions, defaults to 'execution'
 */
export function cleanupProps(
    props: any,
    omitKeys: string[] = ["backend"],
    cleanupFuns: string[] = ["execution"],
): any {
    const propsWithoutBackend = omit(props, omitKeys);
    const cleanup = (value: any, key: string) => {
        if (cleanupFuns.includes(key) && isObject(value)) {
            Object.keys(value).forEach(key => {
                if (isFunction(value[key])) {
                    delete value[key];
                }
            });
        }
    };

    return cloneDeepWith(propsWithoutBackend, cleanup);
}
