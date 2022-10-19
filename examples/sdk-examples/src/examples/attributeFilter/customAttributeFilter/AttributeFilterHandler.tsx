// (C) 2007-2022 GoodData Corporation
import React, { useEffect } from "react";
import { newAttributeFilterHandler } from "@gooddata/sdk-ui-filters";
import { IAttributeFilter, newNegativeAttributeFilter } from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import * as Md from "../../../md/full";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

const handlerExample = (backend: IAnalyticalBackend, workspace: string, filter: IAttributeFilter) => {
    const handler = newAttributeFilterHandler(backend, workspace, filter, { selectionMode: "multi" });

    handler.onInitSuccess(() => {
        // eslint-disable-next-line no-console
        console.log("handler initialized successfully");

        // eslint-disable-next-line no-console
        console.log("loaded attribute metadata:", handler.getAttribute());

        // eslint-disable-next-line no-console
        console.log("two loaded elements:", handler.getAllElements());

        // eslint-disable-next-line no-console
        console.log("selection should be empty:", handler.getCommittedSelection());
    });

    handler.onLoadCustomElementsSuccess((payload) => {
        if (payload.correlation === "customElementsCorrelation") {
            // eslint-disable-next-line no-console
            console.log("custom elements response:", payload);
        }
    });

    handler.loadCustomElements({ offset: 5 }, "customElementsCorrelation");
    handler.setLimit(2);
    handler.init();
    // It's ok to call init multiple times,
    // previous initialization will be canceled if it's still running.
    handler.init();
};

const UseAttributeFilterController = () => {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();

    useEffect(() => {
        handlerExample(backend, workspace, newNegativeAttributeFilter(Md.LocationCity, []));
    }, [backend, workspace]);

    return <div>Look into the browser console.</div>;
};

export default UseAttributeFilterController;
