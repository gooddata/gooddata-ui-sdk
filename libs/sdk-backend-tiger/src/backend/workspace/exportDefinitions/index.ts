// (C) 2019-2024 GoodData Corporation
import {
    EntitiesApiGetAllEntitiesExportDefinitionsRequest,
    JsonApiVisualizationObjectInTypeEnum,
    MetadataUtilities,
    ValidateRelationsHeader,
    jsonApiHeaders,
} from "@gooddata/api-client-tiger";
import {
    IExportDefinitionsQuery,
    IExportDefinitionsQueryOptions,
    IExportDefinitionsQueryResult,
    IGetExportDefinitionOptions,
    IWorkspaceExportDefinitionsService,
    UnexpectedError,
} from "@gooddata/sdk-backend-spi";
import {
    IExportDefinition,
    IInsight,
    IInsightDefinition,
    ObjRef,
    insightId,
    insightSummary,
    insightTags,
    insightTitle,
    objRefToString,
} from "@gooddata/sdk-model";
import { insightFromInsightDefinition } from "../../../convertors/fromBackend/InsightConverter.js";

import { convertInsight } from "../../../convertors/toBackend/InsightConverter.js";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { objRefToIdentifier } from "../../../utils/api.js";

import { InMemoryPaging } from "@gooddata/sdk-backend-base";
import { isInheritedObject } from "../../../convertors/fromBackend/ObjectInheritance.js";
import { convertUserIdentifier } from "../../../convertors/fromBackend/UsersConverter.js";
import { insightListComparator } from "./comparator.js";
import { ExportDefinitionsQuery } from "./exportDefinitionsQuery.js";
import { exportDefinitionOutToExportDefinition } from "../../../convertors/fromBackend/ExportDefinitionsConverter.js";

export class TigerWorkspaceExportDefinitions implements IWorkspaceExportDefinitionsService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {}

    public getExportDefinitions = async (
        options?: IExportDefinitionsQueryOptions,
    ): Promise<IExportDefinitionsQueryResult> => {
        const requestParameters = this.getExportDefinitionsRequestParameters(options);
        const allExportDefinitions = await this.authCall((client) => {
            return MetadataUtilities.getAllPagesOf(
                client,
                client.entities.getAllEntitiesExportDefinitions,
                requestParameters,
                { headers: ValidateRelationsHeader },
            )
                .then(MetadataUtilities.mergeEntitiesResults)
                .then(MetadataUtilities.filterValidEntities)
                .then((res) => {
                    if (options?.title) {
                        const lowercaseSearch = options.title.toLocaleLowerCase();

                        return res.data
                            .filter((ed) => {
                                const title = ed.attributes?.title;

                                return title && title.toLowerCase().indexOf(lowercaseSearch) > -1;
                            })
                            .map((ed) => exportDefinitionOutToExportDefinition(ed, res.included));
                    }
                    return res.data.map((ep) => exportDefinitionOutToExportDefinition(ep, res.included));
                });
        });

        // Remove when API starts to support sort=modifiedBy,createdBy,insight.title
        // (first verify that modifiedBy,createdBy behave as the code below, i.e., use createdBy if modifiedBy is
        // not defined as it is missing for the insights that were just created and never updated, also title
        // should be compared in case-insensitive manner)
        const sanitizedOrder =
            requestParameters.sort === undefined && allExportDefinitions.length > 0
                ? [...allExportDefinitions].sort(insightListComparator)
                : allExportDefinitions;

        return new InMemoryPaging(sanitizedOrder, options?.limit ?? 50, options?.offset ?? 0);
    };

    public getExportDefinitionsQuery = (): IExportDefinitionsQuery => {
        return new ExportDefinitionsQuery(this.authCall, { workspaceId: this.workspace });
    };

    private getExportDefinitionsRequestParameters = (
        options?: IExportDefinitionsQueryOptions,
    ): EntitiesApiGetAllEntitiesExportDefinitionsRequest => {
        const orderBy = options?.orderBy;
        const usesOrderingByUpdated = !orderBy || orderBy === "updated";
        const sortConfiguration = usesOrderingByUpdated ? {} : { sort: [orderBy!] }; // sort: ["modifiedAt", "createdAt"]
        const includeUser =
            options?.loadUserData || options?.author
                ? { include: ["createdBy" as const, "modifiedBy" as const] }
                : {};
        const authorFilter = options?.author ? { filter: `createdBy.id=='${options?.author}'` } : {};

        return { workspaceId: this.workspace, ...sortConfiguration, ...includeUser, ...authorFilter };
    };

    public getExportDefinition = async (
        ref: ObjRef,
        options: IGetExportDefinitionOptions = {},
    ): Promise<IExportDefinition> => {
        const id = await objRefToIdentifier(ref, this.authCall);
        const includeUser = options?.loadUserData
            ? { include: ["createdBy" as const, "modifiedBy" as const] }
            : {};
        const response = await this.authCall((client) =>
            client.entities.getEntityExportDefinitions(
                {
                    objectId: id,
                    workspaceId: this.workspace,
                    ...includeUser,
                },
                {
                    headers: jsonApiHeaders,
                },
            ),
        );

        if (!response.data) {
            throw new UnexpectedError(`Export definition for ${objRefToString(ref)} not found!`);
        }

        const { included, ...exportDefinitionOut } = response.data;

        return exportDefinitionOutToExportDefinition(exportDefinitionOut, included);
    };

    // todo
    public createExportDefinition = async (insight: IInsightDefinition): Promise<IExportDefinition> => {
        const createResponse = await this.authCall((client) => {
            return client.entities.createEntityExportDefinitions(
                {
                    workspaceId: this.workspace,
                    jsonApiVisualizationObjectPostOptionalIdDocument: {
                        data: {
                            type: JsonApiVisualizationObjectInTypeEnum.VISUALIZATION_OBJECT,
                            attributes: {
                                description: insightSummary(insight),
                                content: convertInsight(insight),
                                title: insightTitle(insight),
                                tags: insightTags(insight),
                            },
                        },
                    },
                },
                {
                    headers: jsonApiHeaders,
                },
            );
        });
        const insightData = createResponse.data;
        return insightFromInsightDefinition(
            insight,
            insightData.data.id,
            insightData.links!.self,
            insightData.data.attributes?.tags,
            isInheritedObject(insightData.data),
            insightData.data.attributes?.createdAt,
            insightData.data.attributes?.modifiedAt,
            convertUserIdentifier(insightData.data.relationships?.createdBy, insightData.included),
            convertUserIdentifier(insightData.data.relationships?.modifiedBy, insightData.included),
        );
    };

    // todo
    public updateExportDefinition = async (insight: IInsight): Promise<IExportDefinition> => {
        await this.authCall((client) => {
            return client.entities.updateEntityVisualizationObjects(
                {
                    objectId: insightId(insight),
                    workspaceId: this.workspace,
                    jsonApiVisualizationObjectInDocument: {
                        data: {
                            id: insightId(insight),
                            type: JsonApiVisualizationObjectInTypeEnum.VISUALIZATION_OBJECT,
                            attributes: {
                                description: insightSummary(insight),
                                content: convertInsight(insight),
                                title: insightTitle(insight),
                                tags: insightTags(insight),
                            },
                        },
                    },
                },
                {
                    headers: jsonApiHeaders,
                },
            );
        });
        return insight;
    };

    // todo
    public deleteExportDefinition = async (ref: ObjRef): Promise<void> => {
        const id = await objRefToIdentifier(ref, this.authCall);

        await this.authCall((client) =>
            client.entities.deleteEntityVisualizationObjects({
                objectId: id,
                workspaceId: this.workspace,
            }),
        );
    };
}
