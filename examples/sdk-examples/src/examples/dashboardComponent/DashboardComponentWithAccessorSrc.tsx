// (C) 2022 GoodData Corporation
import React, { useCallback, useState } from "react";
import {
    changeDateFilterSelection,
    Dashboard,
    DashboardConfig,
    DashboardStoreAccessorRepository,
    selectEffectiveDateFilterOptions,
} from "@gooddata/sdk-ui-dashboard";
import { idRef } from "@gooddata/sdk-model";
import { MAPBOX_TOKEN } from "../../constants/fixtures";

const DASHBOARD_ID = "aeO5PVgShc0T";

const dashboardRef = idRef(DASHBOARD_ID);
const config: DashboardConfig = { mapboxToken: MAPBOX_TOKEN, isReadOnly: true };

/**
 * A component to render Dashboard with external store accessors, which enable accessing and/or modifying
 * state from the parent components of the Dashboard component.
 *
 * DashboardStoreAccessorRepository is a singleton storing selectorEvaluator and dispatch object for multiple
 * instances of Dashboard component.
 *
 * To all functions provided by DashboardStoreAccessorRepository object the use of dashboard idRef as well as
 * of dashboard id is possible.
 *
 * For more information, see {@link https://sdk.gooddata.com/gooddata-ui/docs/dashboard_component.html#eventing-props}
 */
const DashboardComponentWithAccessorSrc: React.FC = () => {
    const [selectResult, setSelectResult] = useState<any>();

    /**
     * Sample of how to dispatch `changeDateFilterSelection` event from outside of the dashboard component.
     */
    const onDispatchClick = useCallback(() => {
        if (DashboardStoreAccessorRepository.isAccessorInitializedForDashboard(DASHBOARD_ID)) {
            DashboardStoreAccessorRepository.getDashboardDispatchForDashboard(DASHBOARD_ID)(
                changeDateFilterSelection("relative", "GDC.time.month", "-3", "0"),
            );
        }
    }, []);

    /**
     * Sample of how to use `selectEffectiveDateFilterOptions` selector from outside of the dashboard
     * component.
     */
    const onSelectClick = useCallback(() => {
        if (DashboardStoreAccessorRepository.isAccessorInitializedForDashboard(DASHBOARD_ID)) {
            setSelectResult(
                DashboardStoreAccessorRepository.getDashboardSelectForDashboard(DASHBOARD_ID)(
                    selectEffectiveDateFilterOptions,
                ),
            );
        }
    }, []);

    return (
        <div>
            <div>
                <button onClick={onDispatchClick}>Dispatch changeDateFilterSelection event</button>
                <button onClick={onSelectClick}>Select selectEffectiveDateFilterOptions</button>
            </div>
            {selectResult && (
                <React.Fragment>
                    <h3>Select result</h3>
                    <div>{JSON.stringify(selectResult)}</div>
                </React.Fragment>
            )}
            <Dashboard
                dashboard={dashboardRef}
                config={config}
                onStateChange={DashboardStoreAccessorRepository.getOnChangeHandlerForDashboard(DASHBOARD_ID)}
            />
        </div>
    );
};

export default DashboardComponentWithAccessorSrc;
