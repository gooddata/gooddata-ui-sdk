// (C) 2021 GoodData Corporation
import React, { useMemo, useState } from "react";
import {
    Dashboard,
    DashboardEvents,
    isDashboardDrillToAttributeUrlResolved,
} from "@gooddata/sdk-ui-dashboard";
import { idRef } from "@gooddata/sdk-model";

const dashboardIdRef = idRef("aab2Ug8SFzAC");

export const ImplicitDrillToAttributeUrlScenario: React.FC = () => {
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
            {attributeUrl && <div className="s-attribute-url">{attributeUrl}</div>}
            <Dashboard dashboardRef={dashboardIdRef} eventHandlers={eventHandlers} />
        </>
    );
};
