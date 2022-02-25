// (C) 2019-2022 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { recordedBackend, RecordingIndex } from "@gooddata/sdk-backend-mockingbird";
import { LocalDashboardPluginsConfig } from "../../types";
import { withLocalDashboardPlugins } from "./withLocalDashboardPlugins";
import { withTestWorkspaceSettings } from "./withTestWorkspaceSettings";

export function createRecordedBackend(
    localDashboardPluginsConfig: LocalDashboardPluginsConfig,
): IAnalyticalBackend {
    let Recordings: RecordingIndex;
    try {
        // In case we need to refresh all recordings, they can be removed.
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const RecordedBackend = require("../../../recordings");
        Recordings = RecordedBackend.Recordings;
    } catch (err) {
        Recordings = {};
    }
    return withLocalDashboardPlugins(
        withTestWorkspaceSettings(recordedBackend(Recordings)),
        localDashboardPluginsConfig,
    );
}
