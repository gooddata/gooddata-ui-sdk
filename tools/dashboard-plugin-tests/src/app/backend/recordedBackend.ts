// (C) 2019-2022 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { withLocalDashboardPlugins } from "./withLocalDashboardPlugins";
import { LocalDashboardPluginsConfig } from "../../types";
import { withTestWorkspaceSettings } from "./withTestWorkspaceSettings";

export function createRecordedBackend(
    localDashboardPluginsConfig: LocalDashboardPluginsConfig,
): IAnalyticalBackend {
    return withLocalDashboardPlugins(
        withTestWorkspaceSettings(recordedBackend(ReferenceRecordings.Recordings)),
        localDashboardPluginsConfig,
    );
}
