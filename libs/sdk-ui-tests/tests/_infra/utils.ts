// (C) 2007-2019 GoodData Corporation

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
 */
export function cleanupProps(props: any, omitKeys: string[] = ["execution"]): any {
    return omit(props, omitKeys);
}
