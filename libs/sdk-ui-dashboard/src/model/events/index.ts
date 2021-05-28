// (C) 2021 GoodData Corporation
import {
    DashboardLoaded,
    DashboardSaved,
    DateFilterValidationFailed,
    DashboardCopySaved,
    DashboardRenamed,
    DashboardWasReset,
} from "./dashboard";
import { DashboardCommandFailed, DashboardCommandRejected } from "./general";

export { IDashboardEvent, DashboardEventType } from "./base";
export {
    DateFilterValidationFailed,
    DateFilterValidationResult,
    DashboardLoaded,
    DashboardSaved,
    DashboardCopySaved,
    DashboardRenamed,
    DashboardWasReset,
} from "./dashboard";
export { DashboardCommandRejected, DashboardCommandFailed, CommandFailedErrorReason } from "./general";

/**
 * @internal
 */
export type DashboardEvents =
    | DashboardLoaded
    | DateFilterValidationFailed
    | DashboardCommandFailed
    | DashboardCommandRejected
    | DashboardSaved
    | DashboardCopySaved
    | DashboardRenamed
    | DashboardWasReset;
