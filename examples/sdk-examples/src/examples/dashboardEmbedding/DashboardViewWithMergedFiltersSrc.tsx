// (C) 2007-2021 GoodData Corporation
import React, { useMemo, useState } from "react";
import { DashboardView, mergeFiltersWithDashboard } from "@gooddata/sdk-ui-ext";
import { idRef, newPositiveAttributeFilter } from "@gooddata/sdk-model";
import { IDashboard } from "@gooddata/sdk-backend-spi";
import * as Md from "../../md/full";
import { MAPBOX_TOKEN } from "../../constants/fixtures";

const dashboardRef = idRef("aeO5PVgShc0T");
const filters = [
    newPositiveAttributeFilter(Md.LocationState, {
        uris: ["/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2210/elements?id=6340116"],
    }),
];
const config = { mapboxToken: MAPBOX_TOKEN };

const DashboardViewWithMergedFilters: React.FC = () => {
    const [dashboard, setDashboard] = useState<IDashboard | undefined>();

    const mergedFilters = useMemo(() => {
        return mergeFiltersWithDashboard(dashboard, filters);
    }, [dashboard]);

    return (
        <DashboardView
            dashboard={dashboardRef}
            filters={mergedFilters}
            config={config}
            onDashboardLoaded={({ dashboard }) => setDashboard(dashboard)}
            isReadOnly
        />
    );
};

export default DashboardViewWithMergedFilters;
