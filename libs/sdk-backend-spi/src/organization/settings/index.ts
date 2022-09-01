// (C) 2022 GoodData Corporation

import { IWhiteLabeling } from "@gooddata/sdk-model";

/**
 * This service provides access to organization settings
 *
 * @public
 */
export interface IOrganizationSettingsService {
    /**
     * Sets whiteLabeling for organization.
     *
     * @param whiteLabeling - describes whitelabeling setting for logoUrl, faviconUrl etc.
     *
     * @returns promise
     */
    setWhiteLabeling(whiteLabeling: IWhiteLabeling): Promise<void>;

    /**
     * Sets locale for current workspace.
     *
     * @param locale - IETF BCP 47 Code locale ID, for example "en-US", "cs-CZ", etc.
     *
     * @returns promise
     */
    setLocale(locale: string): Promise<void>;
}
