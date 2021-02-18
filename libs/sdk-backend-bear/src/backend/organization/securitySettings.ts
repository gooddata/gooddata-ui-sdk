// (C) 2021 GoodData Corporation

import { ISecuritySettingsService, ValidationContext } from "@gooddata/sdk-backend-spi";
import { BearAuthenticatedCallGuard } from "../../types/auth";

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

    isUrlValid(url: string, context: ValidationContext): Promise<boolean> {
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
    }
}
