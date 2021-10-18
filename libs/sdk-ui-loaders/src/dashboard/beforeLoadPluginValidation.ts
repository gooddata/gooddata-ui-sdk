// (C) 2021 GoodData Corporation
import { DashboardContext } from "@gooddata/sdk-ui-dashboard";
import { IDashboardPlugin, IDashboardWithReferences } from "@gooddata/sdk-backend-spi";
import { sanitizeUrl } from "@braintree/sanitize-url";

const AboutBlank = "about:blank";

function validateUrl(url: string, messagePrefix: string) {
    const sanitized = sanitizeUrl(url);

    if (url !== sanitized) {
        // sanitized URL being different from the input means there was something fishy with the URL
        if (sanitized === AboutBlank) {
            // sanitization about return about:blank in case the url contains javascript/vbscript/data schemas
            return `${messagePrefix} contains invalid schema; possible XSS detected`;
        }

        return `${messagePrefix} contains invalid characters`;
    }

    // explicitly check for '.' and '..'
    if (url.search(/^\.+$/)) {
        return `${messagePrefix} contains reserved filename characters`;
    }
}

function validatePluginUrlIsSane(plugin: IDashboardPlugin): string | undefined {
    const url = plugin.url;

    // validate URL as is; then decode from percent-encoded URL and do one more round with the same validations
    const validationError = validateUrl(url, "url") ?? validateUrl(decodeURIComponent(url), "decoded url");

    if (validationError) {
        return validationError;
    }

    // finally ensure the plugin is hosted on a secure location
    const parsedUrl: URL = new URL(url);
    if (parsedUrl.protocol !== "https") {
        return `url does not use HTTPS`;
    }
}

function validatePluginUrlsAllowed(_ctx: DashboardContext, _urls: string[]): Promise<boolean> {
    // TODO: add validation against the list of allowed hosts
    return Promise.resolve(true);
}

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
    const {
        references: { plugins },
    } = dashboardWithPlugins;
    const sanePluginUrls: string[] = [];

    for (const plugin of plugins) {
        const failReason = validatePluginUrlIsSane(plugin);

        if (failReason) {
            // eslint-disable-next-line no-console
            console.error("Plugin", plugin, "specifies invalid or outright dangerous URL: ", failReason);
            return false;
        }
    }

    return validatePluginUrlsAllowed(ctx, sanePluginUrls);
}
