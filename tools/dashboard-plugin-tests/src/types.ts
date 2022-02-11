// (C) 2019-2022 GoodData Corporation
import { IDashboardPlugin, IDashboardPluginLink } from "@gooddata/sdk-backend-spi";

/**
 * @internal
 */
export type LocalDashboardPluginsConfig = {
    plugins: IDashboardPlugin[];
    links: {
        [dashboardId: string]: IDashboardPluginLink[];
    };
};
