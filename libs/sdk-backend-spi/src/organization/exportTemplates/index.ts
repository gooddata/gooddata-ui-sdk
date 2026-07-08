// (C) 2026 GoodData Corporation

import { type IExportTemplate, type IExportTemplateDefinition, type ObjRef } from "@gooddata/sdk-model";

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

    /**
     * Get a single export template by its reference.
     *
     * @param ref - reference to the export template
     * @returns promise with the export template
     */
    getExportTemplate(ref: ObjRef): Promise<IExportTemplate>;

    /**
     * Create a new export template.
     *
     * @param template - definition of the export template to create
     * @returns promise with the created export template
     */
    createExportTemplate(template: IExportTemplateDefinition): Promise<IExportTemplate>;

    /**
     * Partially update an existing export template. Only the provided properties are changed.
     *
     * @param ref - reference to the export template to update
     * @param template - subset of the export template properties to change
     * @returns promise with the updated export template
     */
    patchExportTemplate(ref: ObjRef, template: Partial<IExportTemplateDefinition>): Promise<IExportTemplate>;

    /**
     * Delete an existing export template.
     *
     * @param ref - reference to the export template to delete
     * @returns promise
     */
    deleteExportTemplate(ref: ObjRef): Promise<void>;
}
