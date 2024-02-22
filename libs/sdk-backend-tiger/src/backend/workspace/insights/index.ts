// (C) 2019-2024 GoodData Corporation
import {
    IInsightsQueryOptions,
    IInsightsQueryResult,
    IInsightReferences,
    IInsightReferencing,
    IWorkspaceInsightsService,
    SupportedInsightReferenceTypes,
    UnexpectedError,
    IGetInsightOptions,
    IInsightsQuery,
} from "@gooddata/sdk-backend-spi";
import {
    IInsight,
    IInsightDefinition,
    IVisualizationClass,
    ObjRef,
    objRefToString,
    insightTitle,
    insightId,
    IFilter,
    mergeFilters,
    insightFilters,
    insightSetFilters,
    insightTags,
    insightSummary,
} from "@gooddata/sdk-model";
import {
    jsonApiHeaders,
    MetadataUtilities,
    VisualizationObjectModelV1,
    VisualizationObjectModelV2,
    JsonApiVisualizationObjectInTypeEnum,
    ValidateRelationsHeader,
    EntitiesApiGetAllEntitiesVisualizationObjectsRequest,
} from "@gooddata/api-client-tiger";
import {
    insightFromInsightDefinition,
    visualizationObjectsItemToInsight,
} from "../../../convertors/fromBackend/InsightConverter.js";

import { TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { objRefToUri, objRefToIdentifier } from "../../../utils/api.js";
import { convertVisualizationObject } from "../../../convertors/fromBackend/visualizationObjects/VisualizationObjectConverter.js";
import { convertGraphEntityNodeToAnalyticalDashboard } from "../../../convertors/fromBackend/GraphConverter.js";
import { convertInsight } from "../../../convertors/toBackend/InsightConverter.js";

import { visualizationClasses as visualizationClassesMocks } from "./mocks/visualizationClasses.js";
import { InMemoryPaging } from "@gooddata/sdk-backend-base";
import { isInheritedObject } from "../../../convertors/fromBackend/ObjectInheritance.js";
import { convertUserIdentifier } from "../../../convertors/fromBackend/UsersConverter.js";
import { insightListComparator } from "./comparator.js";
import { InsightsQuery } from "./insightsQuery.js";

export class TigerWorkspaceInsights implements IWorkspaceInsightsService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {}

    public getVisualizationClass = async (ref: ObjRef): Promise<IVisualizationClass> => {
        const uri = await objRefToUri(ref, this.workspace, this.authCall);
        const visualizationClasses = await this.getVisualizationClasses();

        const visualizationClass = visualizationClasses.find((v) => v.visualizationClass.uri === uri);
        if (!visualizationClass) {
            throw new UnexpectedError(`Visualization class for ${objRefToString(ref)} not found!`);
        }
        return visualizationClass;
    };

    public getVisualizationClasses = async (): Promise<IVisualizationClass[]> => {
        return this.authCall(async () => visualizationClassesMocks);
    };

    public getInsights = async (options?: IInsightsQueryOptions): Promise<IInsightsQueryResult> => {
        const requestParameters = this.getInsightsRequestParameters(options);
        const allInsights = await this.authCall((client) => {
            return MetadataUtilities.getAllPagesOf(
                client,
                client.entities.getAllEntitiesVisualizationObjects,
                requestParameters,
                { headers: ValidateRelationsHeader },
            )
                .then(MetadataUtilities.mergeEntitiesResults)
                .then(MetadataUtilities.filterValidEntities)
                .then((res) => {
                    if (options?.title) {
                        const lowercaseSearch = options.title.toLocaleLowerCase();

                        return res.data
                            .filter((vo) => {
                                const title = vo.attributes?.title;

                                return title && title.toLowerCase().indexOf(lowercaseSearch) > -1;
                            })
                            .map((insight) => visualizationObjectsItemToInsight(insight, res.included));
                    }
                    return res.data.map((insight) =>
                        visualizationObjectsItemToInsight(insight, res.included),
                    );
                });
        });

        // Remove when API starts to support sort=modifiedBy,createdBy,insight.title
        // (first verify that modifiedBy,createdBy behave as the code below, i.e., use createdBy if modifiedBy is
        // not defined as it is missing for the insights that were just created and never updated, also title
        // should be compared in case-insensitive manner)
        const sanitizedOrder =
            requestParameters.sort === undefined && allInsights.length > 0
                ? [...allInsights].sort(insightListComparator)
                : allInsights;

        return new InMemoryPaging(sanitizedOrder, options?.limit ?? 50, options?.offset ?? 0);
    };

    public getInsightsQuery = (): IInsightsQuery => {
        return new InsightsQuery(this.authCall, { workspaceId: this.workspace });
    };

    private getInsightsRequestParameters = (
        options?: IInsightsQueryOptions,
    ): EntitiesApiGetAllEntitiesVisualizationObjectsRequest => {
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

    public getInsight = async (ref: ObjRef, options: IGetInsightOptions = {}): Promise<IInsight> => {
        const id = await objRefToIdentifier(ref, this.authCall);
        const includeUser = options?.loadUserData
            ? { include: ["createdBy" as const, "modifiedBy" as const] }
            : {};
        const response = await this.authCall((client) =>
            client.entities.getEntityVisualizationObjects(
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
        const { data: visualizationObject, links, included } = response.data;
        const { relationships = {} } = visualizationObject;
        const { createdBy, modifiedBy } = relationships;
        const insight = insightFromInsightDefinition(
            convertVisualizationObject(
                visualizationObject.attributes!.content! as
                    | VisualizationObjectModelV1.IVisualizationObject
                    | VisualizationObjectModelV2.IVisualizationObject,
                visualizationObject.attributes!.title!,
                visualizationObject.attributes!.description!,
                visualizationObject.attributes!.tags,
            ),
            visualizationObject.id,
            links!.self,
            visualizationObject.attributes!.tags,
            isInheritedObject(visualizationObject),
            visualizationObject.attributes?.createdAt,
            visualizationObject.attributes?.modifiedAt,
            convertUserIdentifier(createdBy, included),
            convertUserIdentifier(modifiedBy, included),
        );

        if (!insight) {
            throw new UnexpectedError(`Insight for ${objRefToString(ref)} not found!`);
        }

        return insight;
    };

    public createInsight = async (insight: IInsightDefinition): Promise<IInsight> => {
        const createResponse = await this.authCall((client) => {
            return client.entities.createEntityVisualizationObjects(
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

    public updateInsight = async (insight: IInsight): Promise<IInsight> => {
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

    public deleteInsight = async (ref: ObjRef): Promise<void> => {
        const id = await objRefToIdentifier(ref, this.authCall);

        await this.authCall((client) =>
            client.entities.deleteEntityVisualizationObjects({
                objectId: id,
                workspaceId: this.workspace,
            }),
        );
    };

    public getInsightReferencedObjects = async (
        _insight: IInsight,
        _types?: SupportedInsightReferenceTypes[],
    ): Promise<IInsightReferences> => {
        return Promise.resolve({});
    };

    public getInsightReferencingObjects = async (ref: ObjRef): Promise<IInsightReferencing> => {
        const id = await objRefToIdentifier(ref, this.authCall);
        const entitiesGraph = await this.authCall((client) =>
            client.actions
                .getDependentEntitiesGraphFromEntryPoints({
                    workspaceId: this.workspace,
                    dependentEntitiesRequest: {
                        identifiers: [
                            {
                                id,
                                type: "visualizationObject",
                            },
                        ],
                    },
                })
                .then((res) => res.data.graph),
        );
        const analyticalDashboards = entitiesGraph.nodes
            .filter(({ type }) => type === "analyticalDashboard")
            .map(convertGraphEntityNodeToAnalyticalDashboard);

        return { analyticalDashboards };
    };

    public getInsightWithAddedFilters = async <T extends IInsightDefinition>(
        insight: T,
        filters: IFilter[],
    ): Promise<T> => {
        if (!filters.length) {
            return insight;
        }

        // we assume that all the filters in tiger already use idRefs exclusively
        const mergedFilters = mergeFilters(insightFilters(insight), filters);

        return insightSetFilters(insight, mergedFilters);
    };
}
