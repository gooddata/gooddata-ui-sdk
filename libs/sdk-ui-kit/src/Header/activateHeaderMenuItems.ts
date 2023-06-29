// (C) 2007-2021 GoodData Corporation

import { IHeaderMenuItem } from "./typings.js";

/**
 * @internal
 */
export function activateHeaderMenuItems(items: IHeaderMenuItem[][], ids: Array<string>): IHeaderMenuItem[][] {
    return items.map((headerMenuList) =>
        headerMenuList.map((item: IHeaderMenuItem) => ({ ...item, isActive: ids.indexOf(item.key) >= 0 })),
    );
}
