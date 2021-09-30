// (C) 2021 GoodData Corporation
import React, { useCallback, useMemo, useState } from "react";
import {
    Dashboard,
    DashboardEvents,
    isDashboardDrillToAttributeUrlResolved,
} from "@gooddata/sdk-ui-dashboard";
import { idRef } from "@gooddata/sdk-model";

const id = idRef("aab2Ug8SFzAC");
export const ImplicitDrillToAttributeUrlScenario: React.FC = () => {
    const [attributeUrl, setAttributeUrl] = useState(null);

    const eventHandler = useCallback(
        (event: DashboardEvents) => {
            setAttributeUrl(event.payload.url);
        },
        [setAttributeUrl],
    );

    const eventHandlers = useMemo(
        () => [
            {
                eval: isDashboardDrillToAttributeUrlResolved,
                handler: eventHandler,
            },
        ],
        [eventHandler],
    );

    return (
        <>
            <Dashboard dashboardRef={id} eventHandlers={eventHandlers} />
            {attributeUrl && <div className="s-attribute-url">{attributeUrl}</div>}
        </>
    );
};
