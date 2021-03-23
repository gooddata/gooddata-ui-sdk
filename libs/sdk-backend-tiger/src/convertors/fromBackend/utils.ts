// (C) 2020-2021 GoodData Corporation

/**
 * TODO: TIGER-HACK: a nasty way to identify that an object is inherited from some parent workspace. This is
 *  determined by checking for colon character in the object identifier.
 *
 * @param id - object identifier
 */
export function isInheritedObject(id: string): boolean {
    return id.indexOf(":") > -1;
}
