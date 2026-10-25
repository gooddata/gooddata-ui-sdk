// (C) 2021-2026 GoodData Corporation

import { v4 as uuid } from "uuid";

import { type ObjRef, objRefToString } from "@gooddata/sdk-model";
import { type IMetricInfo } from "@gooddata/sdk-ui-metric-component";

export function createTabIdentifier(ref: ObjRef): string {
    return `metric/${objRefToString(ref)}`;
}

export function createNewTabIdentifier(): string {
    return `new-metric/${uuid()}`;
}

export function containsTab(measures: IMetricInfo[], tabIdentifier: string) {
    return measures.some((tab) => tab.identifier === tabIdentifier);
}
