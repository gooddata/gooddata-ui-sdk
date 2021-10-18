// (C) 2021 GoodData Corporation
import { DashboardContext } from "@gooddata/sdk-ui-dashboard";
import { IDashboardWithReferences } from "@gooddata/sdk-backend-spi";

/**
 * Validates plugins before actually loading them from remote location.
 *
 * @param ctx - context in which the dashboard operates
 * @param dashboardWithPlugins - dashboard with plugins
 */
export async function validatePluginsBeforeLoading(
    ctx: DashboardContext,
    dashboardWithPlugins: IDashboardWithReferences,
): Promise<boolean> {
    const { backend, workspace } = ctx;
    const {
        references: { plugins },
    } = dashboardWithPlugins;
    const organization = await backend.organizations().getCurrentOrganization();

    for (const plugin of plugins) {
        const pluginResult = organization.securitySettings().isDashboardPluginUrlValid(plugin.url, workspace);

        if (!pluginResult) {
            // eslint-disable-next-line no-console
            console.error(`Dashboard plugin URL is not valid: ${plugin.url}`);

            return false;
        }
    }

    return true;
}
