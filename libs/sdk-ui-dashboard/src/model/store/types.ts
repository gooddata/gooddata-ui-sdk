// (C) 2021-2023 GoodData Corporation
import { AnyAction, Dispatch, EntityState } from "@reduxjs/toolkit";
import { IInsight, IWidgetAlert, IListedDashboard } from "@gooddata/sdk-model";
import { LoadingState } from "./loading/loadingState.js";
import { SavingState } from "./saving/savingState.js";
import { FilterContextState } from "./filterContext/filterContextState.js";
import { LayoutState } from "./layout/layoutState.js";
import { ConfigState } from "./config/configState.js";
import { EntitlementsState } from "./entitlements/entitlementsState.js";
import { DateFilterConfigState } from "./dateFilterConfig/dateFilterConfigState.js";
import { PermissionsState } from "./permissions/permissionsState.js";
import { CatalogState } from "./catalog/catalogState.js";
import { UserState } from "./user/userState.js";
import { DrillState } from "./drill/drillState.js";
import { DashboardMetaState } from "./meta/metaState.js";
import { BackendCapabilitiesState } from "./backendCapabilities/backendCapabilitiesState.js";
import { IDrillTargets } from "./drillTargets/drillTargetsTypes.js";
import { IExecutionResultEnvelope } from "./executionResults/types.js";
import { UiState } from "./ui/uiState.js";
import { LegacyDashboardsState } from "./legacyDashboards/legacyDashboardsState.js";
import { RenderModeState } from "./renderMode/renderModeState.js";
import { DashboardPermissionsState } from "./dashboardPermissions/dashboardPermissionsState.js";
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
    /** @beta */
    loading: LoadingState;
    saving: SavingState;
    backendCapabilities: BackendCapabilitiesState;
    config: ConfigState;
    /** @beta */
    entitlements: EntitlementsState;
    permissions: PermissionsState;
    filterContext: FilterContextState;
    /** @alpha */
    layout: LayoutState;
    /** @beta */
    dateFilterConfig: DateFilterConfigState;
    catalog: CatalogState;
    user: UserState;
    /** @beta */
    meta: DashboardMetaState;
    /** @beta */
    drill: DrillState;
    legacyDashboards: LegacyDashboardsState;
    // Entities
    /** @beta */
    insights: EntityState<IInsight>;
    /** @beta */
    alerts: EntityState<IWidgetAlert>;
    /** @alpha */
    drillTargets: EntityState<IDrillTargets>;
    /** @beta */
    listedDashboards: EntityState<IListedDashboard>;
    /** @beta */
    accessibleDashboards: EntityState<IListedDashboard>;
    /** @alpha */
    inaccessibleDashboards: EntityState<IInaccessibleDashboard>;
    dashboardPermissions: DashboardPermissionsState;

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
    executionResults: EntityState<IExecutionResultEnvelope>;

    /**
     * Part of state where the different dashboard component queries may cache their results.
     *
     * @internal
     */
    _queryCache: {
        [queryName: string]: any;
    };
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
