// (C) 2021-2022 GoodData Corporation
import { validatePluginUrlIsSane } from "@gooddata/sdk-backend-base";
import { ISecuritySettingsService, ValidationContext } from "@gooddata/sdk-backend-spi";
import { BearAuthenticatedCallGuard } from "../../types/auth.js";
import isEmpty from "lodash/isEmpty.js";

export interface IValidationResponse {
    validationResponse: {
        valid: boolean;
    };
}

export class SecuritySettingsService implements ISecuritySettingsService {
    /**
     * Constructs a new SecuritySettingsService
     * @param authCall - call guard to perform API calls through
     * @param scope - URI of the scope. For now only the organization (domain) URI is supported by the backend.
     *  The plan is to support also workspace URI and user profile URI.
     */
    constructor(private readonly authCall: BearAuthenticatedCallGuard, public readonly scope: string) {}

    public isUrlValid = (url: string, context: ValidationContext): Promise<boolean> => {
        return this.authCall(async (sdk) =>
            sdk.xhr
                .postParsed<IValidationResponse>("/gdc/securitySettings/validate", {
                    body: {
                        validationRequest: {
                            type: context,
                            value: url,
                            scope: this.scope,
                        },
                    },
                })
                .then(({ validationResponse }) => {
                    return validationResponse.valid;
                }),
        );
    };

    public isDashboardPluginUrlValid = async (url: string, workspace: string): Promise<boolean> => {
        const sanitizationError = validatePluginUrlIsSane(url);

        if (sanitizationError) {
            console.warn("Dashboard plugin URL is not valid: ", sanitizationError);

            return false;
        }

        const setting = await this.authCall(async (sdk) => {
            return sdk.project.getConfigItem(workspace, "dashboardPluginHosts");
        });

        return validateAgainstList(url, setting?.settingItem?.value);
    };
}

export function validateAgainstList(url: string, listContent: any): boolean {
    if (!listContent || isEmpty(listContent) || typeof listContent !== "string") {
        return false;
    }

    const allowedHosts = listContent
        .split(";")
        .map((entry) => entry.trim())
        .filter((entry) => !isEmpty(entry));

    return allowedHosts.some((host) => url.startsWith(host));
}
