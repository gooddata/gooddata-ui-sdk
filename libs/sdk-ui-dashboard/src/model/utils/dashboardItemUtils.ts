// (C) 2021 GoodData Corporation
import { ExtendedDashboardItem } from "../types/layoutTypes";
import { ObjRef } from "@gooddata/sdk-model";
import { isInsightWidget } from "@gooddata/sdk-backend-spi";

export function extractInsightRefsFromItems(items: ReadonlyArray<ExtendedDashboardItem>): ObjRef[] {
    const result: ObjRef[] = [];

    items.forEach((item) => {
        if (isInsightWidget(item.widget)) {
            result.push(item.widget.insight);
        }
    });

    return result;
}
