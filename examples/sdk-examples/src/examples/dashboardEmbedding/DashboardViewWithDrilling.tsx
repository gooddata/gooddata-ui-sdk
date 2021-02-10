// (C) 2007-2018 GoodData Corporation
import React from "react";
import { DashboardView } from "@gooddata/sdk-ui-ext/esm/internal";
import { idRef } from "@gooddata/sdk-model";
import { MAPBOX_TOKEN } from "../../constants/fixtures";
import { HeaderPredicates } from "@gooddata/sdk-ui";

const dashboardRef = idRef("aeO5PVgShc0T");
const config = { mapboxToken: MAPBOX_TOKEN };

const DashboardViewWithDrilling: React.FC = () => {
    return (
        <DashboardView
            dashboard={dashboardRef}
            config={config}
            drillableItems={[HeaderPredicates.attributeItemNameMatch("Daly City")]}
            onDrill={(e) => {
                // eslint-disable-next-line no-console
                console.log("Drill event in DashboardView: ", e);
            }}
            isReadOnly
        />
    );
};

export default DashboardViewWithDrilling;
