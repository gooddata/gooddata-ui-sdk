// (C) 2007-2024 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";
import {
    IDashboardLayoutSectionFacade,
    IDashboardLayoutItemFacade,
} from "../../_staging/dashboard/legacyFluidLayout/index.js";

export function getRefsForSection(section: IDashboardLayoutSectionFacade<unknown>): (ObjRef | undefined)[] {
    return section.items().map((item) => item.ref());
}

export function getRefsForItem(item: IDashboardLayoutItemFacade<unknown>): (ObjRef | undefined)[] {
    return [item.ref()];
}
