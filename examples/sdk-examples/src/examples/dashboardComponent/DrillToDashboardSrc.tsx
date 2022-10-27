// (C) 2007-2022 GoodData Corporation
import React, { useMemo, useState } from "react";
import {
    changeFilterContextSelection,
    Dashboard,
    DashboardConfig,
    DashboardDrillToDashboardResolved,
    DashboardEventHandler,
    isDashboardDrillToDashboardResolved,
    isDashboardInitialized,
} from "@gooddata/sdk-ui-dashboard";
import { areObjRefsEqual, idRef } from "@gooddata/sdk-model";
import { MAPBOX_TOKEN } from "../../constants/fixtures";

const isDrillToSameDashboard = (e: DashboardDrillToDashboardResolved) =>
    !e.payload.drillDefinition.target ||
    areObjRefsEqual(e.payload.drillDefinition.target, e.ctx.dashboardRef!);

const defaultDashboardRef = idRef("abwvXygRN7cv");
const config: DashboardConfig = { mapboxToken: MAPBOX_TOKEN, isReadOnly: true };

const DrillToDashboard: React.FC = () => {
    const [drillEvent, setDrillEvent] = useState<DashboardDrillToDashboardResolved | null>(null);

    const defaultDashboardEventHandlers = useMemo(() => {
        const handlers: DashboardEventHandler[] = [
            // Handle drill to a same dashboard - just update the filter context.
            {
                eval: (e) => isDashboardDrillToDashboardResolved(e) && isDrillToSameDashboard(e),
                handler: (e: DashboardDrillToDashboardResolved, dispatch) => {
                    dispatch(changeFilterContextSelection(e.payload.filters));
                },
            },
            // Handle drill to a different dashboard - propagate the drill event to a local state.
            {
                eval: (e) => isDashboardDrillToDashboardResolved(e) && !isDrillToSameDashboard(e),
                handler: (e: DashboardDrillToDashboardResolved) => {
                    setDrillEvent(e);
                },
            },
        ];

        return handlers;
    }, []);

    const drillDashboardEventHandlers = useMemo(() => {
        const handlers: DashboardEventHandler[] = [
            // Update the filter context, once the "drill" dashboard is initialized.
            {
                eval: (e) => isDashboardInitialized(e),
                handler: (_, dispatch) => {
                    if (drillEvent) {
                        dispatch(changeFilterContextSelection(drillEvent.payload.filters));
                    }
                },
            },
        ];

        return handlers;
    }, [drillEvent]);

    return (
        <div>
            {!!drillEvent && (
                <>
                    <button
                        className="gd-button gd-button-primary"
                        onClick={() => {
                            setDrillEvent(null);
                        }}
                    >
                        &lt; Go back
                    </button>
                    <Dashboard
                        dashboard={drillEvent?.payload.drillDefinition.target}
                        config={config}
                        eventHandlers={drillDashboardEventHandlers}
                    />
                </>
            )}
            <div
                // Avoid reloading of the default dashboard,
                // by hiding it during the drill with CSS, instead of full re-mount.
                style={{ height: drillEvent ? 0 : "auto", overflow: "hidden" }}
            >
                <Dashboard
                    dashboard={defaultDashboardRef}
                    config={config}
                    eventHandlers={defaultDashboardEventHandlers}
                />
            </div>
        </div>
    );
};

export default DrillToDashboard;
