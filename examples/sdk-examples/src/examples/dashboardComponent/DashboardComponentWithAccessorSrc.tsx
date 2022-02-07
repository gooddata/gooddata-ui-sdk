// (C) 2022 GoodData Corporation
import React, { useCallback, useState } from "react";
import {
    changeDateFilterSelection,
    Dashboard,
    DashboardConfig,
    MultipleDashboardStoreAccessor,
    selectEffectiveDateFilterOptions,
} from "@gooddata/sdk-ui-dashboard";
import { idRef } from "@gooddata/sdk-model";
import { MAPBOX_TOKEN } from "../../constants/fixtures";

const DASHBOARD_ID = "aeO5PVgShc0T";

const dashboardRef = idRef(DASHBOARD_ID);
const config: DashboardConfig = { mapboxToken: MAPBOX_TOKEN, isReadOnly: true };

const DashboardComponentWithAccessorSrc: React.FC = () => {
    const dashboardStoreAccessor = MultipleDashboardStoreAccessor.getInstance();
    const [selectResult, setSelectResult] = useState<any>();

    const onDispatchClick = useCallback(() => {
        if (dashboardStoreAccessor.isAccessorInitializedForDashboard(DASHBOARD_ID)) {
            dashboardStoreAccessor.getAccessorsForDashboard(DASHBOARD_ID).getDispatch()(
                changeDateFilterSelection("relative", "GDC.time.month", "-3", "0"),
            );
        }
    }, [dashboardStoreAccessor]);

    const onSelectClick = useCallback(() => {
        if (dashboardStoreAccessor.isAccessorInitializedForDashboard(DASHBOARD_ID)) {
            setSelectResult(
                dashboardStoreAccessor.getAccessorsForDashboard(DASHBOARD_ID).getSelector()(
                    selectEffectiveDateFilterOptions,
                ),
            );
        }
    }, [dashboardStoreAccessor]);

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
                onStateChange={dashboardStoreAccessor.getOnChangeHandlerForDashboard(DASHBOARD_ID)}
            />
        </div>
    );
};

export default DashboardComponentWithAccessorSrc;
