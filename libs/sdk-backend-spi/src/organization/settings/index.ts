// (C) 2022 GoodData Corporation

import { IWhiteLabeling } from "@gooddata/sdk-model";

/**
 * This service provides access to organization settings
 *
 * @public
 */
export interface IOrganizationSettingsService {
    /**
     * Set whiteLabeling in organization.
     *
     * @returns promise
     */
    setWhiteLabeling(whiteLabeling: IWhiteLabeling): Promise<void>;
}
