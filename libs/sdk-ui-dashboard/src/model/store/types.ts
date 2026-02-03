// (C) 2021-2026 GoodData Corporation

import { type AnyAction, type Dispatch, type EntityId, type EntityState } from "@reduxjs/toolkit";

import { type IInsight, type IListedDashboard } from "@gooddata/sdk-model";

import { type IAccessibleDashboardsState } from "./accessibleDashboards/index.js";
import { type IAutomationsState } from "./automations/automationsState.js";
import { type BackendCapabilitiesState } from "./backendCapabilities/backendCapabilitiesState.js";
import { type CatalogState } from "./catalog/catalogState.js";
import { type ConfigState } from "./config/configState.js";
import { type DashboardPermissionsState } from "./dashboardPermissions/dashboardPermissionsState.js";
import { type IDrillState } from "./drill/drillState.js";
import { type IDrillTargets } from "./drillTargets/drillTargetsTypes.js";
import { type IEntitlementsState } from "./entitlements/entitlementsState.js";
import { type IExecutedState } from "./executed/executedState.js";
import { type IExecutionResultEnvelope } from "./executionResults/types.js";
import { type IFilterViewsState } from "./filterViews/filterViewsState.js";
import { type ILoadingState } from "./loading/loadingState.js";
import { type IDashboardMetaState } from "./meta/metaState.js";
import { type INotificationChannelsState } from "./notificationChannels/notificationChannelsState.js";
import { type PermissionsState } from "./permissions/permissionsState.js";
import { type IRenderModeState } from "./renderMode/renderModeState.js";
import { type SavingState } from "./saving/savingState.js";
import { type IShowWidgetAsTableState } from "./showWidgetAsTable/showWidgetAsTableState.js";
import { type ITabsState } from "./tabs/tabsState.js";
import { type IUiState } from "./ui/uiState.js";
import { type UserState } from "./user/userState.js";
import { type IUsersState } from "./users/usersState.js";
import { type IInaccessibleDashboard } from "../types/inaccessibleDashboardTypes.js";
import { type DashboardSummaryWorkflowState } from "./dashboardSummaryWorkflow/dashboardSummaryWorkflowState.js";

/*
 * This explicit typing is unfortunate but cannot find better way. Normally the typings get inferred from store,
 * however since this code creates store dynamically such thing is not possible.
 *
 * Beware.. even if we get the inference working through the use of some throw-away internal, the
 * api-extractor will have problems if just the inferred types gets exported unless the value
 * from which it is inferred is exported as well.
 */

/**
 * Layout of the dashboard component's state. State modifications are always done using Command API. Reading
 * from state must always be done using the Selectors API.
 *
 * Accessing state props directly is dangerous practice. We reserve the rights to refactor and otherwise break
 * the shape of the state at any time while keeping the Selectors and Command APIs stable.
 *
 * @public
 */
export type DashboardState = {
    /**
     * List of widget IDs that should be shown as table view.
     * @internal
     */
    showWidgetAsTable: IShowWidgetAsTableState;
    /** @beta */
    loading: ILoadingState;
    saving: SavingState;
    executed: IExecutedState;
    backendCapabilities: BackendCapabilitiesState;
    config: ConfigState;
    /** @beta */
    entitlements: IEntitlementsState;
    permissions: PermissionsState;
    /** @alpha */
    tabs: ITabsState;
    catalog: CatalogState;
    user: UserState;
    /** @beta */
    meta: IDashboardMetaState;
    /** @beta */
    drill: IDrillState;
    // Entities
    /** @beta */
    insights: EntityState<IInsight, EntityId>;
    /** @alpha */
    drillTargets: EntityState<IDrillTargets, EntityId>;
    /** @beta */
    listedDashboards: EntityState<IListedDashboard, EntityId>;
    /** @beta */
    accessibleDashboards: IAccessibleDashboardsState;
    /** @alpha */
    inaccessibleDashboards: EntityState<IInaccessibleDashboard, EntityId>;
    dashboardPermissions: DashboardPermissionsState;
    /** @alpha */
    automations: IAutomationsState;
    /** @alpha */
    users: IUsersState;
    /** @alpha */
    notificationChannels: INotificationChannelsState;

    /**
     * Internal state for dashboard summary AI workflow.
     *
     * @internal
     */
    dashboardSummaryWorkflow: DashboardSummaryWorkflowState;

    /**
     * State controlling how exactly the dashboard is rendered.
     * @beta
     */
    renderMode: IRenderModeState;

    /**
     * Ui state controllable from the outside.
     * @beta
     */
    ui: IUiState;

    /**
     * Part of state where execution results of the individual widgets are stored.
     * @beta
     */
    executionResults: EntityState<IExecutionResultEnvelope, EntityId>;

    /**
     * Part of state where the different dashboard component queries may cache their results.
     *
     * @internal
     */
    _queryCache: {
        [queryName: string]: any;
    };

    filterViews: IFilterViewsState;
};

/**
 * @public
 */
export type DashboardDispatch = Dispatch<AnyAction>;

/**
 * Function that selects part of the Dashboard state.
 *
 * @public
 */
export type DashboardSelector<TResult> = (state: DashboardState) => TResult;
/**
 * Type of a callback that evaluates a selector function against the Dashboard state
 *
 * @public
 */
export type DashboardSelectorEvaluator = <TResult>(selector: DashboardSelector<TResult>) => TResult;
