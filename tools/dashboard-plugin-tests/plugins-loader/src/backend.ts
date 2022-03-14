// (C) 2019-2022 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import bearFactory, { ContextDeferredAuthProvider } from "@gooddata/sdk-backend-bear";
import flow from "lodash/flow";

import { withTestPlugins } from "./withTestPlugins";
import { withTestSettings } from "./withTestSettings";
import { IDashboardPluginTestConfig } from "./setup";

/**
 * @internal
 */
export function createBackend(config: IDashboardPluginTestConfig): IAnalyticalBackend {
    return flow(
        withTestPlugins(config),
        withTestSettings(config),
    )(bearFactory().withAuthentication(new ContextDeferredAuthProvider()));
}
