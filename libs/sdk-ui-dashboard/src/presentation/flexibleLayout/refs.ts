// (C) 2007-2025 GoodData Corporation
import { type ObjRef } from "@gooddata/sdk-model";

import {
    type IDashboardLayoutItemFacade,
    type IDashboardLayoutSectionFacade,
} from "../../_staging/dashboard/flexibleLayout/index.js";

export function getRefsForSection(section: IDashboardLayoutSectionFacade<unknown>): (ObjRef | undefined)[] {
    return section.items().map((item) => item.ref());
}

export function getRefsForItem(item: IDashboardLayoutItemFacade<unknown>): (ObjRef | undefined)[] {
    return [item.ref()];
}
