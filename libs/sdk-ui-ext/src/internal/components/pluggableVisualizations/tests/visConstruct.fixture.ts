// (C) 2019-2025 GoodData Corporation
import { noop } from "lodash-es";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";

export const DummyVisConstruct = {
    projectId: "testWorkspace",
    backend: dummyBackend(),
    element: (): null => null,
    configPanelElement: (): null => null,
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
