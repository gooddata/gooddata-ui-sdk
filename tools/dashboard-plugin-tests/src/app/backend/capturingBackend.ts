// (C) 2019-2022 GoodData Corporation
import bearFactory, { FixedLoginAndPasswordAuthProvider } from "@gooddata/sdk-backend-bear";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { withLocalDashboardPlugins } from "./withLocalDashboardPlugins";
import { LocalDashboardPluginsConfig } from "../../types";
import { withCapturing } from "./withCapturing";
import { withTestWorkspaceSettings } from "./withTestWorkspaceSettings";

export function createCapturingBackend(
    localDashboardPluginsConfig: LocalDashboardPluginsConfig,
): IAnalyticalBackend {
    return withLocalDashboardPlugins(
        withCapturing(
            withTestWorkspaceSettings(
                bearFactory().withAuthentication(
                    new FixedLoginAndPasswordAuthProvider(
                        process.env.GDC_USERNAME!,
                        process.env.GDC_PASSWORD!,
                    ),
                ),
            ),
        ),
        localDashboardPluginsConfig,
    );
}
