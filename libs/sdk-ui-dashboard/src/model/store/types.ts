// (C) 2021-2022 GoodData Corporation
import { AnyAction, Dispatch, EntityState } from "@reduxjs/toolkit";
import { IInsight, IWidgetAlert, IListedDashboard } from "@gooddata/sdk-model";
import { LoadingState } from "./loading/loadingState";
import { SavingState } from "./saving/savingState";
import { FilterContextState } from "./filterContext/filterContextState";
import { LayoutState } from "./layout/layoutState";
import { ConfigState } from "./config/configState";
import { DateFilterConfigState } from "./dateFilterConfig/dateFilterConfigState";
import { PermissionsState } from "./permissions/permissionsState";
import { CatalogState } from "./catalog/catalogState";
import { UserState } from "./user/userState";
import { DrillState } from "./drill/drillState";
import { DashboardMetaState } from "./meta/metaState";
import { BackendCapabilitiesState } from "./backendCapabilities/backendCapabilitiesState";
import { IDrillTargets } from "./drillTargets/drillTargetsTypes";
import { IExecutionResultEnvelope } from "./executionResults/types";
import { UiState } from "./ui/uiState";
import { LegacyDashboardsState } from "./legacyDashboards/legacyDashboardsState";
import { RenderModeState } from "./renderMode/renderModeState";

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
 * @alpha
 */
export interface DashboardState {
    loading: LoadingState;
    saving: SavingState;
    backendCapabilities: BackendCapabilitiesState;
    config: ConfigState;
    permissions: PermissionsState;
    filterContext: FilterContextState;
    layout: LayoutState;
    dateFilterConfig: DateFilterConfigState;
    catalog: CatalogState;
    user: UserState;
    meta: DashboardMetaState;
    drill: DrillState;
    legacyDashboards: LegacyDashboardsState;
    // Entities
    insights: EntityState<IInsight>;
    alerts: EntityState<IWidgetAlert>;
    drillTargets: EntityState<IDrillTargets>;
    listedDashboards: EntityState<IListedDashboard>;
    accessibleDashboards: EntityState<IListedDashboard>;

    /**
     * State controlling how exactly the dashboard is rendered.
     */
    renderMode: RenderModeState;

    /**
     * Ui state controllable from the outside.
     */
    ui: UiState;

    /**
     * Part of state where execution results of the individual widgets are stored.
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
