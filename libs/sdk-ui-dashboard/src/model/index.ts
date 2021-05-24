// (C) 2021 GoodData Corporation

/*
 * The public API of the Dashboard model is exported from here.
 *
 * What is exported:
 *
 * -  hooks do dispatch commands / call selectors
 * -  all selectors & the typing of state with which they work
 * -  all events & their types. Note: event factories are not exported on purpose. outside code should not be
 *    creating events
 * -  all commands, their types & command factories
 */

export {
    useDashboardSelector,
    useDashboardDispatch,
    DashboardDispatch,
    DashboardState,
} from "./state/dashboardStore";

export { loadingSelector } from "./state/loading/loadingSelectors";
export { LoadingState } from "./state/loading/loadingState";
export { filterContextSelector } from "./state/filterContext/filterContextSelectors";
export { FilterContextState } from "./state/filterContext/filterContextState";
export { layoutSelector } from "./state/layout/layoutSelectors";
export { LayoutState } from "./state/layout/layoutState";
export { insightsSelector } from "./state/insights/insightsSelectors";
export { DashboardEvents, DashboardEventType, DashboardLoaded, IDashboardEvent } from "./events/dashboard";
export { DashboardEventHandler } from "./events/eventHandler";

export {
    IDashboardCommand,
    loadDashboard,
    DashboardCommands,
    LoadDashboard,
    DashboardCommandType,
} from "./commands/dashboard";
export { DashboardContext } from "./types/commonTypes";
