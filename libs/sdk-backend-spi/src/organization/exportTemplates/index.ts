// (C) 2026 GoodData Corporation

import { type IExportTemplate } from "@gooddata/sdk-model";

/**
 * Service for managing organization-level export templates.
 *
 * @beta
 */
export interface IOrganizationExportTemplatesService {
    /**
     * Get the list of available export templates for slide exports.
     *
     * @returns promise with array of export templates available in the organization
     */
    getExportTemplates(): Promise<IExportTemplate[]>;
}
