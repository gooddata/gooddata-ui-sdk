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
    DashboardState,
    DashboardDispatch,
    useDashboardDispatch,
    useDashboardSelector,
    loadingSelector,
    LoadingState,
    layoutSelector,
    LayoutState,
    filterContextSelector,
    FilterContextState,
    insightsSelector,
    DashboardContext,
} from "./state";

export { DashboardEvents, DashboardEventType, DashboardLoaded, IDashboardEvent } from "./events/dashboard";

export { DashboardEventHandler } from "./events/eventHandler";

export {
    IDashboardCommand,
    loadDashboard,
    DashboardCommands,
    LoadDashboard,
    DashboardCommandType,
} from "./commands/dashboard";
