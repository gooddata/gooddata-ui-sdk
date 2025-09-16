// (C) 2021-2025 GoodData Corporation

import { useMemo, useState } from "react";

import { idRef } from "@gooddata/sdk-model";
import {
    Dashboard,
    DashboardEvents,
    isDashboardDrillToAttributeUrlResolved,
} from "@gooddata/sdk-ui-dashboard";

const dashboardIdRef = idRef("aackEGSRSdLz");

export function ImplicitDrillToAttributeUrlScenario() {
    const [attributeUrl, setAttributeUrl] = useState(null);

    const eventHandlers = useMemo(
        () => [
            {
                eval: isDashboardDrillToAttributeUrlResolved,
                handler: (event: DashboardEvents) => {
                    setAttributeUrl(event.payload.url);
                },
            },
        ],
        [setAttributeUrl],
    );

    return (
        <>
            {attributeUrl ? <div className="s-attribute-url">{attributeUrl}</div> : null}
            <Dashboard dashboard={dashboardIdRef} eventHandlers={eventHandlers} />
        </>
    );
}
