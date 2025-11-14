// (C) 2021-2025 GoodData Corporation

import { AnyAction, Dispatch, EntityId, EntityState } from "@reduxjs/toolkit";

import { IInsight, IListedDashboard } from "@gooddata/sdk-model";

import { AccessibleDashboardsState } from "./accessibleDashboards/index.js";
import { AutomationsState } from "./automations/automationsState.js";
import { BackendCapabilitiesState } from "./backendCapabilities/backendCapabilitiesState.js";
import { CatalogState } from "./catalog/catalogState.js";
import { ConfigState } from "./config/configState.js";
import { DashboardPermissionsState } from "./dashboardPermissions/dashboardPermissionsState.js";
import { DrillState } from "./drill/drillState.js";
import { IDrillTargets } from "./drillTargets/drillTargetsTypes.js";
import { EntitlementsState } from "./entitlements/entitlementsState.js";
import { ExecutedState } from "./executed/executedState.js";
import { IExecutionResultEnvelope } from "./executionResults/types.js";
import { FilterViewsState } from "./filterViews/filterViewsState.js";
import { LayoutState } from "./layout/layoutState.js";
import { LoadingState } from "./loading/loadingState.js";
import { DashboardMetaState } from "./meta/metaState.js";
import { NotificationChannelsState } from "./notificationChannels/notificationChannelsState.js";
import { PermissionsState } from "./permissions/permissionsState.js";
import { RenderModeState } from "./renderMode/renderModeState.js";
import { SavingState } from "./saving/savingState.js";
import { ShowWidgetAsTableState } from "./showWidgetAsTable/showWidgetAsTableState.js";
import { TabsState } from "./tabs/tabsState.js";
import { UiState } from "./ui/uiState.js";
import { UserState } from "./user/userState.js";
import { UsersState } from "./users/usersState.js";
import { IInaccessibleDashboard } from "../types/inaccessibleDashboardTypes.js";

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
export interface DashboardState {
    /**
     * List of widget IDs that should be shown as table view.
     * @internal
     */
    showWidgetAsTable: ShowWidgetAsTableState;
    /** @beta */
    loading: LoadingState;
    saving: SavingState;
    executed: ExecutedState;
    backendCapabilities: BackendCapabilitiesState;
    config: ConfigState;
    /** @beta */
    entitlements: EntitlementsState;
    permissions: PermissionsState;
    /** @alpha */
    layout: LayoutState;
    /** @alpha */
    tabs: TabsState;
    catalog: CatalogState;
    user: UserState;
    /** @beta */
    meta: DashboardMetaState;
    /** @beta */
    drill: DrillState;
    // Entities
    /** @beta */
    insights: EntityState<IInsight, EntityId>;
    /** @alpha */
    drillTargets: EntityState<IDrillTargets, EntityId>;
    /** @beta */
    listedDashboards: EntityState<IListedDashboard, EntityId>;
    /** @beta */
    accessibleDashboards: AccessibleDashboardsState;
    /** @alpha */
    inaccessibleDashboards: EntityState<IInaccessibleDashboard, EntityId>;
    dashboardPermissions: DashboardPermissionsState;
    /** @alpha */
    automations: AutomationsState;
    /** @alpha */
    users: UsersState;
    /** @alpha */
    notificationChannels: NotificationChannelsState;

    /**
     * State controlling how exactly the dashboard is rendered.
     * @beta
     */
    renderMode: RenderModeState;

    /**
     * Ui state controllable from the outside.
     * @beta
     */
    ui: UiState;

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

    filterViews: FilterViewsState;
}

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
