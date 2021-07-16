// (C) 2021 GoodData Corporation
import { areObjRefsEqual, ObjRef } from "@gooddata/sdk-model";
import { DashboardDrillToDashboardTriggered } from "../events/drill";
import { DashboardEventHandler } from "../events/eventHandler";
import { changeFilterContextSelection } from "../commands/filters";

/**
 * Event handler with the default implementation for drill to the same dashboard.
 *
 * When {@link DashboardDrillToDashboardTriggered} event is fired and contains dashboard ref that matches the provided dashboard ref,
 * or dashboard ref in the event is missing, it sets relevant drill intersection filters to the current dashboard.
 *
 * Note that only filters that are already stored in the dashboard filter context will be applied
 * (attribute filters that are not visible in the filter bar will not be applied).
 *
 * @alpha
 * @param dashboardRef - reference to the current dashboard
 * @returns event handler
 */
export const createDrillToSameDashboardHandler = (
    dashboardRef: ObjRef,
): DashboardEventHandler<DashboardDrillToDashboardTriggered> => ({
    eval: (event) =>
        event.type === "GDC.DASH/EVT.DRILL.DRILL_TO_DASHBOARD.TRIGGERED" &&
        (!event.payload.drillDefinition.target ||
            areObjRefsEqual(event.payload.drillDefinition.target, dashboardRef)),
    handler: (event, dispatch) => {
        dispatch(changeFilterContextSelection(event.payload.filters));
    },
});
