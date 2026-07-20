// (C) 2026 GoodData Corporation

import { type IWorkspaceExportTemplatesService } from "@gooddata/sdk-backend-spi";
import { type IExportTemplate, type IExportTemplateDefinition, type ObjRef } from "@gooddata/sdk-model";

/**
 * @alpha
 */
export abstract class DecoratedWorkspaceExportTemplatesService implements IWorkspaceExportTemplatesService {
    protected constructor(protected readonly decorated: IWorkspaceExportTemplatesService) {}

    public getExportTemplates(): Promise<IExportTemplate[]> {
        return this.decorated.getExportTemplates();
    }

    public getExportTemplate(ref: ObjRef): Promise<IExportTemplate> {
        return this.decorated.getExportTemplate(ref);
    }

    public createExportTemplate(template: IExportTemplateDefinition): Promise<IExportTemplate> {
        return this.decorated.createExportTemplate(template);
    }

    public patchExportTemplate(
        ref: ObjRef,
        template: Partial<IExportTemplateDefinition>,
    ): Promise<IExportTemplate> {
        return this.decorated.patchExportTemplate(ref, template);
    }

    public deleteExportTemplate(ref: ObjRef): Promise<void> {
        return this.decorated.deleteExportTemplate(ref);
    }
}
