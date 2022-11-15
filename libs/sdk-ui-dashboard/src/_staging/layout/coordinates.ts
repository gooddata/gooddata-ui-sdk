// (C) 2019-2022 GoodData Corporation

import { ILayoutCoordinates } from "../../types";
import { IDashboardLayoutItemFacade } from "../dashboard/fluidLayout/facade/interfaces";

/**
 * @internal
 */
export function getLayoutCoordinates(item: IDashboardLayoutItemFacade<unknown>): ILayoutCoordinates {
    return {
        sectionIndex: item.section()?.index(),
        itemIndex: item.index(),
    };
}
