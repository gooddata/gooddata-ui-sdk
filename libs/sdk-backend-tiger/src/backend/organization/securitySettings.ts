// (C) 2021 GoodData Corporation
import { ISecuritySettingsService, ValidationContext } from "@gooddata/sdk-backend-spi";

export class SecuritySettingsService implements ISecuritySettingsService {
    /**
     * Constructs a new SecuritySettingsService
     *
     * @param scope - ID of the scope. For now the backend does not support this and returns true for all calls.
     *  The plan is to support domain, workspace ID and user profile ID.
     */
    constructor(public readonly scope: string) {}

    isUrlValid(url: string, context: ValidationContext): Promise<boolean> {
        // eslint-disable-next-line no-console
        console.warn(
            "'isUrlValid' function is not supported by Tiger backend, true is returned for parameters:",
            url,
            context,
        );
        return Promise.resolve(true);
    }
}
