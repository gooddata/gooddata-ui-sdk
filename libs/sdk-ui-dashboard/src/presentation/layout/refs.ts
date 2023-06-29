// (C) 2007-2022 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";
import {
    IDashboardLayoutSectionFacade,
    IDashboardLayoutItemFacade,
} from "../../_staging/dashboard/fluidLayout/index.js";

export function getRefsForSection(section: IDashboardLayoutSectionFacade<unknown>): (ObjRef | undefined)[] {
    return section.items().map((item) => item.ref());
}

export function getRefsForItem(item: IDashboardLayoutItemFacade<unknown>): (ObjRef | undefined)[] {
    return [item.ref()];
}
