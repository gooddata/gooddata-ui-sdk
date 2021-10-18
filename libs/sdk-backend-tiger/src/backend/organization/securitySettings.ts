// (C) 2021 GoodData Corporation
import { ISecuritySettingsService, ValidationContext } from "@gooddata/sdk-backend-spi";
import { validatePluginUrlIsSane } from "@gooddata/sdk-backend-base";

export class SecuritySettingsService implements ISecuritySettingsService {
    /**
     * Constructs a new SecuritySettingsService
     *
     * @param scope - ID of the scope. For now the backend does not support this and returns true for all calls.
     *  The plan is to support domain, workspace ID and user profile ID.
     */
    constructor(public readonly scope: string) {}

    public isUrlValid = (url: string, context: ValidationContext): Promise<boolean> => {
        // eslint-disable-next-line no-console
        console.warn(
            "'isUrlValid' function is not supported by Tiger backend, true is returned for parameters:",
            url,
            context,
        );
        return Promise.resolve(true);
    };

    public isDashboardPluginUrlValid = async (url: string): Promise<boolean> => {
        const sanitizationError = validatePluginUrlIsSane(url);

        if (sanitizationError) {
            // eslint-disable-next-line no-console
            console.warn("Dashboard plugin URL is not valid: ", sanitizationError);

            return false;
        }

        if (typeof location === "undefined") {
            // eslint-disable-next-line no-console
            console.error("Plugin validation unable to obtain current location.");

            return false;
        }

        const currentLocation = `${location.protocol}//${location.host}`;

        return Promise.resolve(url.startsWith(currentLocation));
    };
}
