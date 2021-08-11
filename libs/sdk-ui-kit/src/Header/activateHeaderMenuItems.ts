// (C) 2007-2021 GoodData Corporation

import { IHeaderMenuItem } from "./typings";

/**
 * @internal
 */
export function activateHeaderMenuItems(items: IHeaderMenuItem[][], ids: Array<string>): IHeaderMenuItem[][] {
    return items.reduce((arrHeaderMenuItems, headerMenuList) => {
        arrHeaderMenuItems.push(
            headerMenuList.map((item: IHeaderMenuItem) => {
                return { ...item, isActive: ids.indexOf(item.key) >= 0 };
            }),
        );
        return arrHeaderMenuItems;
    }, [] as IHeaderMenuItem[][]);
}
