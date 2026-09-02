// (C) 2026 GoodData Corporation

import { v4 as uuidv4 } from "uuid";

import { ActionsUtilities } from "@gooddata/api-client-tiger";
import {
    EntitiesApi_CreateEntityReportPageLayouts,
    EntitiesApi_CreateEntityReportTemplates,
    EntitiesApi_CreateEntityReports,
    EntitiesApi_DeleteEntityReportPageLayouts,
    EntitiesApi_DeleteEntityReportTemplates,
    EntitiesApi_DeleteEntityReports,
    EntitiesApi_GetAllEntitiesReportPageLayouts,
    EntitiesApi_GetAllEntitiesReportTemplates,
    EntitiesApi_GetAllEntitiesReports,
    EntitiesApi_GetEntityReportPageLayouts,
    EntitiesApi_GetEntityReportTemplates,
    EntitiesApi_GetEntityReports,
    EntitiesApi_UpdateEntityReportPageLayouts,
    EntitiesApi_UpdateEntityReportTemplates,
    EntitiesApi_UpdateEntityReports,
} from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import { type IWorkspaceReportsService, UnexpectedError } from "@gooddata/sdk-backend-spi";
import {
    BuiltInReportPageLayouts,
    type IReport,
    type IReportDefinition,
    type IReportPageLayout,
    type IReportPageLayoutDefinition,
    type IReportTemplate,
    type IReportTemplateDefinition,
    type IReportsBrandKit,
    type ObjRef,
    areObjRefsEqual,
    objRefToString,
    sanitizeReportsBrandKit,
} from "@gooddata/sdk-model";

import {
    convertReport,
    convertReportPageLayout,
    convertReportTemplate,
} from "../../convertors/fromBackend/ReportsConverter.js";
import {
    convertReportPageLayoutToBackend,
    convertReportTemplateToBackend,
    convertReportToBackend,
} from "../../convertors/toBackend/ReportsConverter.js";
import { type TigerAuthenticatedCallGuard } from "../../types/index.js";
import { objRefToIdentifier } from "../../utils/api.js";

import { TigerWorkspaceSettings } from "./settings/index.js";

function findBuiltInPageLayout(ref: ObjRef): IReportPageLayout | undefined {
    return BuiltInReportPageLayouts.find((layout) => areObjRefsEqual(layout.ref, ref));
}

export class TigerWorkspaceReportsService implements IWorkspaceReportsService {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly workspace: string,
    ) {}

    public getReportPageLayouts = async (): Promise<IReportPageLayout[]> => {
        const layouts = await this.authCall((client) =>
            ActionsUtilities.loadAllPages(({ page, size }) =>
                EntitiesApi_GetAllEntitiesReportPageLayouts(client.axios, client.basePath, {
                    workspaceId: this.workspace,
                    metaInclude: ["origin"],
                    page,
                    size,
                }).then((response) => response.data.data.map(convertReportPageLayout)),
            ),
        );
        return [...BuiltInReportPageLayouts, ...layouts];
    };

    public getReportPageLayout = async (ref: ObjRef): Promise<IReportPageLayout> => {
        const builtIn = findBuiltInPageLayout(ref);
        if (builtIn) {
            return builtIn;
        }
        const objectId = objRefToIdentifier(ref, this.authCall);
        return this.authCall(async (client) => {
            const response = await EntitiesApi_GetEntityReportPageLayouts(client.axios, client.basePath, {
                workspaceId: this.workspace,
                objectId,
                metaInclude: ["origin"],
            });
            return convertReportPageLayout(response.data.data);
        });
    };

    public createReportPageLayout = async (
        layout: IReportPageLayoutDefinition,
    ): Promise<IReportPageLayout> => {
        const id = this.newObjectId(layout.ref, "Report page layout");
        return this.authCall(async (client) => {
            const response = await EntitiesApi_CreateEntityReportPageLayouts(client.axios, client.basePath, {
                workspaceId: this.workspace,
                jsonApiReportPageLayoutPostOptionalIdDocument: {
                    data: {
                        type: "reportPageLayout",
                        id,
                        attributes: convertReportPageLayoutToBackend(layout),
                    },
                },
            });
            return convertReportPageLayout(response.data.data);
        });
    };

    public updateReportPageLayout = async (layout: IReportPageLayout): Promise<IReportPageLayout> => {
        const objectId = this.editableObjectId(layout.ref, "Report page layout");
        return this.authCall(async (client) => {
            const response = await EntitiesApi_UpdateEntityReportPageLayouts(client.axios, client.basePath, {
                workspaceId: this.workspace,
                objectId,
                jsonApiReportPageLayoutInDocument: {
                    data: {
                        type: "reportPageLayout",
                        id: objectId,
                        attributes: convertReportPageLayoutToBackend(layout),
                    },
                },
            });
            return convertReportPageLayout(response.data.data);
        });
    };

    public deleteReportPageLayout = async (ref: ObjRef): Promise<void> => {
        const objectId = this.editableObjectId(ref, "Report page layout");
        await this.authCall((client) =>
            EntitiesApi_DeleteEntityReportPageLayouts(client.axios, client.basePath, {
                workspaceId: this.workspace,
                objectId,
            }),
        );
    };

    public getReportTemplates = async (): Promise<IReportTemplate[]> => {
        return this.authCall((client) =>
            ActionsUtilities.loadAllPages(({ page, size }) =>
                EntitiesApi_GetAllEntitiesReportTemplates(client.axios, client.basePath, {
                    workspaceId: this.workspace,
                    metaInclude: ["origin"],
                    page,
                    size,
                }).then((response) => response.data.data.map(convertReportTemplate)),
            ),
        );
    };

    public getReportTemplate = async (ref: ObjRef): Promise<IReportTemplate> => {
        const objectId = objRefToIdentifier(ref, this.authCall);
        return this.authCall(async (client) => {
            const response = await EntitiesApi_GetEntityReportTemplates(client.axios, client.basePath, {
                workspaceId: this.workspace,
                objectId,
                metaInclude: ["origin"],
            });
            return convertReportTemplate(response.data.data);
        });
    };

    public createReportTemplate = async (template: IReportTemplateDefinition): Promise<IReportTemplate> => {
        const id = template.ref ? objRefToIdentifier(template.ref, this.authCall) : uuidv4();
        return this.authCall(async (client) => {
            const response = await EntitiesApi_CreateEntityReportTemplates(client.axios, client.basePath, {
                workspaceId: this.workspace,
                jsonApiReportTemplatePostOptionalIdDocument: {
                    data: {
                        type: "reportTemplate",
                        id,
                        attributes: convertReportTemplateToBackend(template),
                    },
                },
            });
            return convertReportTemplate(response.data.data);
        });
    };

    public updateReportTemplate = async (template: IReportTemplate): Promise<IReportTemplate> => {
        const objectId = objRefToIdentifier(template.ref, this.authCall);
        return this.authCall(async (client) => {
            const response = await EntitiesApi_UpdateEntityReportTemplates(client.axios, client.basePath, {
                workspaceId: this.workspace,
                objectId,
                jsonApiReportTemplateInDocument: {
                    data: {
                        type: "reportTemplate",
                        id: objectId,
                        attributes: convertReportTemplateToBackend(template),
                    },
                },
            });
            return convertReportTemplate(response.data.data);
        });
    };

    public deleteReportTemplate = async (ref: ObjRef): Promise<void> => {
        const objectId = objRefToIdentifier(ref, this.authCall);
        await this.authCall((client) =>
            EntitiesApi_DeleteEntityReportTemplates(client.axios, client.basePath, {
                workspaceId: this.workspace,
                objectId,
            }),
        );
    };

    public getReports = async (): Promise<IReport[]> => {
        return this.authCall((client) =>
            ActionsUtilities.loadAllPages(({ page, size }) =>
                EntitiesApi_GetAllEntitiesReports(client.axios, client.basePath, {
                    workspaceId: this.workspace,
                    metaInclude: ["origin"],
                    page,
                    size,
                }).then((response) => response.data.data.map(convertReport)),
            ),
        );
    };

    public getReport = async (ref: ObjRef): Promise<IReport> => {
        const objectId = objRefToIdentifier(ref, this.authCall);
        return this.authCall(async (client) => {
            const response = await EntitiesApi_GetEntityReports(client.axios, client.basePath, {
                workspaceId: this.workspace,
                objectId,
                metaInclude: ["origin"],
            });
            return convertReport(response.data.data);
        });
    };

    public createReport = async (report: IReportDefinition): Promise<IReport> => {
        const id = report.ref ? objRefToIdentifier(report.ref, this.authCall) : uuidv4();
        return this.authCall(async (client) => {
            const response = await EntitiesApi_CreateEntityReports(client.axios, client.basePath, {
                workspaceId: this.workspace,
                jsonApiReportPostOptionalIdDocument: {
                    data: {
                        type: "report",
                        id,
                        attributes: convertReportToBackend(report),
                    },
                },
            });
            return convertReport(response.data.data);
        });
    };

    public updateReport = async (report: IReport): Promise<IReport> => {
        const objectId = objRefToIdentifier(report.ref, this.authCall);
        return this.authCall(async (client) => {
            const response = await EntitiesApi_UpdateEntityReports(client.axios, client.basePath, {
                workspaceId: this.workspace,
                objectId,
                jsonApiReportInDocument: {
                    data: {
                        type: "report",
                        id: objectId,
                        attributes: convertReportToBackend(report),
                    },
                },
            });
            return convertReport(response.data.data);
        });
    };

    public deleteReport = async (ref: ObjRef): Promise<void> => {
        const objectId = objRefToIdentifier(ref, this.authCall);
        await this.authCall((client) =>
            EntitiesApi_DeleteEntityReports(client.axios, client.basePath, {
                workspaceId: this.workspace,
                objectId,
            }),
        );
    };

    public getBrandKit = async (): Promise<IReportsBrandKit | undefined> => {
        const settings = await this.settings().getSettings();
        return sanitizeReportsBrandKit(settings.reportsBrandKit);
    };

    public setBrandKit = async (brandKit: IReportsBrandKit): Promise<void> => {
        const sanitized = sanitizeReportsBrandKit(brandKit);
        if (sanitized === undefined) {
            throw new UnexpectedError("The provided value is not a valid brand kit.");
        }
        await this.settings().setReportsBrandKit(sanitized);
    };

    public deleteBrandKit = async (): Promise<void> => {
        await this.settings().deleteReportsBrandKit();
    };

    private settings(): TigerWorkspaceSettings {
        return new TigerWorkspaceSettings(this.authCall, this.workspace);
    }

    private newObjectId(ref: ObjRef | undefined, what: string): string {
        if (!ref) {
            return uuidv4();
        }
        this.assertNotBuiltIn(ref, what);
        return objRefToIdentifier(ref, this.authCall);
    }

    private editableObjectId(ref: ObjRef, what: string): string {
        this.assertNotBuiltIn(ref, what);
        return objRefToIdentifier(ref, this.authCall);
    }

    private assertNotBuiltIn(ref: ObjRef, what: string): void {
        if (findBuiltInPageLayout(ref)) {
            throw new UnexpectedError(`${what} "${objRefToString(ref)}" is built-in and cannot be changed.`);
        }
    }
}
