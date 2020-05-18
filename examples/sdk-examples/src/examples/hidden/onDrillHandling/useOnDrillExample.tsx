// (C) 2019 GoodData Corporation
import React, { useState } from "react";
import { IDrillEvent } from "@gooddata/sdk-ui";

export const useOnDrillExample = () => {
    const [drillEvent, setDrillEvent] = useState<IDrillEvent>();

    const onDrill = (drillEvent: IDrillEvent) => setDrillEvent(drillEvent);

    const renderDrillEvent = <pre className="s-output">{JSON.stringify(drillEvent, null, 4)}</pre>;

    return {
        onDrill,
        renderDrillEvent,
    };
};
