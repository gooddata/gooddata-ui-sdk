// (C) 2022-2026 GoodData Corporation

import { type IObjectShareDraft } from "@gooddata/sdk-ui-ext";

import { type SaveNameMode } from "../Content/EditMetricContent.data.js";
import { type FormField } from "../Form/data.js";
import { type IMeasureDef, type IMeasureSetting } from "../metric/metricHelpers.js";

/**
 * @internal
 */
export enum MetricInfoKind {
    Create = "CREATE",
    Edit = "EDIT",
}

/**
 * @internal
 */
export type IMetricInfo = IMeasureSetting & {
    initial: IMeasureDef;
    current: IMeasureDef;
    identifier: string;
    kind: MetricInfoKind;
    saveMode?: SaveNameMode;
    focusedField?: FormField;
    generateNewId?: boolean;
    /** Access drafted but not saved. Held by the tab because a switch unmounts the editor. */
    draftAccess?: IObjectShareDraft;
};

/**
 * @internal
 */
export type IMetricInfoDraft = Omit<IMetricInfo, "identifier">;

/**
 * @internal
 */
export enum CloseAllStatus {
    Close = "close",
    Canceled = "canceled",
    Complete = "complete",
    Incomplete = "incomplete",
}

/**
 * @internal
 */
export type CloseAllTabsResult = CloseAllTabsWithCancel | CloseAllTabsWithProceed;

/**
 * @internal
 */
export type CloseAllTabsWithCancel = {
    status: CloseAllStatus.Canceled | CloseAllStatus.Close;
};

/**
 * @internal
 */
export type CloseAllTabsWithProceed = {
    status: CloseAllStatus.Incomplete | CloseAllStatus.Complete;
    closedTabs: IMetricInfo[];
    invalidTabs: IMetricInfo[];
};
