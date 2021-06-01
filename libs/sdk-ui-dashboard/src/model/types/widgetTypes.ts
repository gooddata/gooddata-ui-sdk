// (C) 2021 GoodData Corporation

import { IDashboardFilterReference } from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";

/**
 * @internal
 */
export type WidgetHeader = {
    /**
     * Title to set. If not defined then widget will have no title.
     */
    title?: string;
};

/**
 * @internal
 */
export type WidgetFilterSettings = {
    /**
     * Dashboard filters to ignore for particular widget.
     *
     * TODO: Verify the date filter variant. I suspect this may be unused currently? When the dashboard's
     *  Date filter is turned off for a widget, then the dateDataSet is cleared
     */
    readonly ignoreDashboardFilters?: IDashboardFilterReference[];

    /**
     * Date data set that will be used when constructing date filter for a widget.
     *
     * If the widget does not specify any dateDataSet, then no date filtering is applied to it.
     *
     * TODO: verify this. seems to be the case from my experiments but could be missing some cases.
     */
    readonly dateDataSet?: ObjRef;
};
