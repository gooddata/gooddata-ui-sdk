// (C) 2022 GoodData Corporation
import React, { useState } from "react";
import {
    changeDateFilterSelection,
    Dashboard,
    DashboardConfig,
    DashboardStoreAccessor,
    selectEffectiveDateFilterOptions,
} from "@gooddata/sdk-ui-dashboard";
import { idRef } from "@gooddata/sdk-model";
import { MAPBOX_TOKEN } from "../../constants/fixtures";

const dashboardRef = idRef("aeO5PVgShc0T");
const config: DashboardConfig = { mapboxToken: MAPBOX_TOKEN, isReadOnly: true };

const DashboardComponentWithAccessorSrc: React.FC = () => {
    const dashboardStoreAccessor = DashboardStoreAccessor.getInstance();
    const [selectResult, setSelectResult] = useState<any>();

    const onDispatchClick = () => {
        if (dashboardStoreAccessor.isDashboardStoreAccessorInitialized()) {
            dashboardStoreAccessor.getDispatch()(
                changeDateFilterSelection("relative", "GDC.time.month", "-3", "0"),
            );
        }
    };

    const onSelectClick = () => {
        if (dashboardStoreAccessor.isDashboardStoreAccessorInitialized()) {
            setSelectResult(dashboardStoreAccessor.getSelector()(selectEffectiveDateFilterOptions));
        }
    };

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
                onStateChange={dashboardStoreAccessor.setSelectAndDispatch}
            />
        </div>
    );
};

export default DashboardComponentWithAccessorSrc;
