// (C) 2019-2022 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { createBearBackend } from "./bearBackend";
import { createRecordedBackend } from "./recordedBackend";
import { LocalDashboardPluginsConfig } from "../../types";
import { createCapturingBackend } from "./capturingBackend";

export function createBackend(localDashboardPluginsConfig: LocalDashboardPluginsConfig): IAnalyticalBackend {
    switch (BACKEND_TYPE) {
        case "live": {
            return createBearBackend(localDashboardPluginsConfig);
        }
        case "recorded": {
            return createRecordedBackend(localDashboardPluginsConfig);
        }
        case "capturing": {
            return createCapturingBackend(localDashboardPluginsConfig);
        }
        default: {
            throw Error("No backend type specified!");
        }
    }
}
