// (C) 2019-2025 GoodData Corporation

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";

export const DummyVisConstruct = {
    projectId: "testWorkspace",
    backend: dummyBackend(),
    element: (): null => null,
    configPanelElement: (): null => null,
    callbacks: {
        onError: () => {},
        afterRender: () => {},
        onDrill: () => {},
        onExportReady: () => {},
        onLoadingChanged: () => {},
        pushData: () => {},
    },
    renderFun: () => {},
    visualizationProperties: {},
};
