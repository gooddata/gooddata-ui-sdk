// (C) 2021 GoodData Corporation
import { EntityState } from "@reduxjs/toolkit";
import { IInsight } from "@gooddata/sdk-model";
import { LoadingState } from "./loading/loadingState";
import { FilterContextState } from "./filterContext/filterContextState";
import { LayoutState } from "./layout/layoutState";
import { ConfigState } from "./config/configState";
import { DateFilterConfigState } from "./dateFilterConfig/dateFilterConfigState";
import { PermissionsState } from "./permissions/permissionsState";
import { IListedDashboard, IWidgetAlert } from "@gooddata/sdk-backend-spi";
import { CatalogState } from "./catalog/catalogState";
import { UserState } from "./user/userState";
import { DashboardMetaState } from "./meta/metaState";

/**
 * TODO: unfortunate. normally the typings get inferred from store. However since this code creates store
 *  dynamically such thing is not possible. Beware.. even if we get the inference working, the api-extractor
 *  will have problems if just the type gets exported unless the value from which it is inferred is exported
 *  as well.
 *
 * @internal
 */
export type DashboardState = {
    loading: LoadingState;
    config: ConfigState;
    permissions: PermissionsState;
    filterContext: FilterContextState;
    layout: LayoutState;
    dateFilterConfig: DateFilterConfigState;
    catalog: CatalogState;
    user: UserState;
    meta: DashboardMetaState;
    // Entities
    insights: EntityState<IInsight>;
    alerts: EntityState<IWidgetAlert>;
    listedDashboards: EntityState<IListedDashboard>;

    /**
     * Part of state where the different dashboard component queries may cache their results.
     *
     * @internal
     */
    _queryCache: {
        [queryName: string]: any;
    };
};
