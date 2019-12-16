// (C) 2019 GoodData Corporation
import React, { useState } from "react";

export const useOnDrillExample = () => {
    const [state, setState] = useState({
        drillEvent: null,
    });

    const onDrill = drillEvent => setState({ drillEvent });

    const renderDrillEvent = <pre className="s-output">{JSON.stringify(state.drillEvent, null, 4)}</pre>;

    return {
        onDrill,
        renderDrillEvent,
    };
};
