// (C) 2021-2026 GoodData Corporation

import { ActionsApi_ValidateEmbeddingOrigin } from "@gooddata/api-client-tiger/endpoints/actions";
import { validatePluginUrlIsSane } from "@gooddata/sdk-backend-base";
import { type ISecuritySettingsService, type ValidationContext } from "@gooddata/sdk-backend-spi";

import { type TigerAuthenticatedCallGuard } from "../../types/index.js";

export class SecuritySettingsService implements ISecuritySettingsService {
    /**
     * Constructs a new SecuritySettingsService
     *
     * @param scope - ID of the organization.
     * @param authCall - authenticated call guard of the backend.
     */
    constructor(
        public readonly scope: string,
        private readonly authCall: TigerAuthenticatedCallGuard,
    ) {}

    /**
     * For the `UI_EVENT` context, asks the backend if the origin is in the embedding origins of the
     * organization. It resolves `false` only when the backend answers that the origin is not valid,
     * and rejects on every error, so that a caller never takes an error for a denial.
     *
     * The backend does not support the other contexts; they resolve `true`.
     */
    public isUrlValid = async (url: string, context: ValidationContext): Promise<boolean> => {
        if (context !== "UI_EVENT") {
            console.warn(
                "'isUrlValid' function is not supported by Tiger backend, true is returned for parameters:",
                url,
                context,
            );
            return true;
        }

        const { data } = await this.authCall((client) =>
            ActionsApi_ValidateEmbeddingOrigin(client.axios, client.basePath, {
                validateEmbeddingOriginRequest: { origin: url },
            }),
        );
        return data.valid === true;
    };

    public isDashboardPluginUrlValid = async (url: string): Promise<boolean> => {
        const sanitizationError = validatePluginUrlIsSane(url);

        if (sanitizationError) {
            console.warn("Dashboard plugin URL is not valid: ", sanitizationError);

            return false;
        }

        // On tiger, it is responsibility of the installation admin to correctly set the CSP. The browser
        // will then prevent loading plugins from unsupported locations
        //
        return Promise.resolve(true);
    };
}
