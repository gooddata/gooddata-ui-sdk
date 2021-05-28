// (C) 2021 GoodData Corporation

import { LoadDashboard, RenameDashboard, ResetDashboard, SaveDashboard, SaveDashboardAs } from "./dashboard";

export { DashboardCommandType, IDashboardCommand } from "./base";
export {
    LoadDashboard,
    loadDashboard,
    SaveDashboardAs,
    saveDashboardAs,
    SaveDashboard,
    saveDashboard,
    RenameDashboard,
    renameDashboard,
    ResetDashboard,
    resetDashboard,
} from "./dashboard";

/**
 * @internal
 */
export type DashboardCommands =
    | LoadDashboard
    | SaveDashboard
    | SaveDashboardAs
    | RenameDashboard
    | ResetDashboard;
