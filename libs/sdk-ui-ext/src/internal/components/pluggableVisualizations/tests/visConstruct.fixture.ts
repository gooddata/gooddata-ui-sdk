// (C) 2019-2020 GoodData Corporation
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import noop from "lodash/noop";

export const DummyVisConstruct = {
    projectId: "testWorkspace",
    backend: dummyBackend(),
    element: "none",
    configPanelElement: "none",
    callbacks: {
        onError: noop,
        afterRender: noop,
        onDrill: noop,
        onExportReady: noop,
        onLoadingChanged: noop,
        pushData: noop,
    },
    renderFun: noop,
    visualizationProperties: {},
};
