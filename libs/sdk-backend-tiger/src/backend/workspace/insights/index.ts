// (C) 2019-2025 GoodData Corporation
import {
    EntitiesApiGetAllEntitiesVisualizationObjectsRequest,
    EntitiesApiGetEntityVisualizationObjectsRequest,
    JsonApiAttributeOutWithLinks,
    JsonApiMetricOutIncludes,
    JsonApiVisualizationObjectInTypeEnum,
    MetadataUtilities,
    VisualizationObjectModelV1,
    VisualizationObjectModelV2,
    isAttributeItem,
    isDataSetItem,
    isFactItem,
    isLabelItem,
    isMetricItem,
    jsonApiHeaders,
} from "@gooddata/api-client-tiger";
import { ServerPaging } from "@gooddata/sdk-backend-base";
import {
    IGetInsightOptions,
    IInsightReferences,
    IInsightReferencing,
    IInsightsQuery,
    IInsightsQueryOptions,
    IInsightsQueryResult,
    IWorkspaceInsightsService,
    SupportedInsightReferenceTypes,
    UnexpectedError,
} from "@gooddata/sdk-backend-spi";
import {
    ICatalogAttribute,
    ICatalogFact,
    ICatalogMeasure,
    IFilter,
    IInsight,
    IInsightDefinition,
    IVisualizationClass,
    ObjRef,
    insightFilters,
    insightId,
    insightSetFilters,
    insightSummary,
    insightTags,
    insightTitle,
    mergeFilters,
    objRefToString,
} from "@gooddata/sdk-model";

import { InsightsQuery } from "./insightsQuery.js";
import { visualizationClasses as visualizationClassesMocks } from "./mocks/visualizationClasses.js";
import {
    convertAttribute,
    convertFact,
    convertMeasure,
} from "../../../convertors/fromBackend/CatalogConverter.js";
import { convertGraphEntityNodeToAnalyticalDashboard } from "../../../convertors/fromBackend/GraphConverter.js";
import {
    convertVisualizationObjectsToInsights,
    insightFromInsightDefinition,
} from "../../../convertors/fromBackend/InsightConverter.js";
import { isInheritedObject } from "../../../convertors/fromBackend/ObjectInheritance.js";
import { convertUserIdentifier } from "../../../convertors/fromBackend/UsersConverter.js";
import { convertVisualizationObject } from "../../../convertors/fromBackend/visualizationObjects/VisualizationObjectConverter.js";
import { convertInsight } from "../../../convertors/toBackend/InsightConverter.js";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { objRefToIdentifier, objRefToUri } from "../../../utils/api.js";

export class TigerWorkspaceInsights implements IWorkspaceInsightsService {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        public readonly workspace: string,
    ) {}

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
        return ServerPaging.for(
            async ({ limit, offset }) => {
                const filterObj = requestParameters.filter
                    ? {
                          filter: requestParameters.filter,
                      }
                    : {};
                return await this.authCall((client) =>
                    client.entities.getAllEntitiesVisualizationObjects({
                        ...requestParameters,
                        metaInclude: ["page"],
                        ...filterObj,
                        size: limit,
                        page: offset / limit,
                    }),
                )
                    .then((res) => MetadataUtilities.filterValidEntities(res.data))
                    .then((data) => {
                        return {
                            items: convertVisualizationObjectsToInsights(data),
                            totalCount: data.meta?.page?.totalElements ?? 0,
                        };
                    });
            },
            options?.limit,
            options?.offset,
        );
    };

    public getInsightsQuery = (): IInsightsQuery => {
        return new InsightsQuery(this.authCall, { workspaceId: this.workspace });
    };

    private getInsightsRequestParameters = (
        options?: IInsightsQueryOptions,
    ): EntitiesApiGetAllEntitiesVisualizationObjectsRequest => {
        const orderBy = options?.orderBy;
        const usesOrderingByUpdated = !orderBy || orderBy === "updated";
        const sortConfiguration = usesOrderingByUpdated
            ? { sort: ["modifiedAt,createdAt,title,desc"] }
            : { sort: [orderBy!] };
        const includeUser =
            options?.loadUserData || options?.author
                ? { include: ["createdBy" as const, "modifiedBy" as const] }
                : {};
        const filterParts = [];
        if (options?.author) {
            filterParts.push(`createdBy.id=='${options?.author}'`);
        }
        if (options?.title) {
            filterParts.push(`title=containsic='${options?.title}'`);
        }
        const filterObj = filterParts.length ? { filter: filterParts.join(";") } : {};
        return { workspaceId: this.workspace, ...sortConfiguration, ...includeUser, ...filterObj };
    };

    private fetchAttributes = async (attrs: string[], labels: string[]): Promise<ICatalogAttribute[]> => {
        if (!attrs.length && !labels.length) {
            return Promise.resolve([]);
        }

        const filter = [
            ...labels.map((label) => `labels.id==${label}`),
            ...attrs.map((attr) => `id==${attr}`),
        ].join(",");
        const response = await this.authCall((client) => {
            return client.entities
                .getAllEntitiesAttributes(
                    {
                        workspaceId: this.workspace,
                        filter,
                        include: ["labels", "defaultView", "dataset"],
                    },
                    {
                        headers: jsonApiHeaders,
                    },
                )
                .then((res) => res.data);
        });

        const attributes: ICatalogAttribute[] = response.data.map((item: JsonApiAttributeOutWithLinks) => {
            const includedItems = response.included || [];
            const labels = (item.relationships?.labels?.data ?? []).map((label) => label.id);
            const dataset = item.relationships?.dataset?.data?.id;

            const relatedLabels = includedItems
                .filter((item) => labels.includes(item.id))
                .filter(isLabelItem);
            const relatedDataset = includedItems.filter((item) => item.id === dataset).filter(isDataSetItem);
            const primaryRelatedLabel = relatedLabels.find((label) => label.attributes?.primary);
            const geoLabels = relatedLabels.filter((label) => label.attributes?.valueType?.match(/GEO/));
            const defaultLabel = primaryRelatedLabel ?? relatedLabels[0];
            return convertAttribute(item, defaultLabel, geoLabels, relatedLabels, relatedDataset[0]);
        });

        return attributes;
    };

    /**
     * Fetch insight and related catalog items
     * @internal
     */
    public getInsightWithCatalogItems = async (
        ref: ObjRef,
    ): Promise<{
        insight: IInsight;
        catalogItems: Array<ICatalogFact | ICatalogMeasure | ICatalogAttribute>;
    }> => {
        const { insight, included } = await this.getInsightWithReferences(ref, [
            "metrics" as const,
            "attributes" as const,
            "facts" as const,
            "labels" as const,
        ]);

        // get attributes by labels.id and individual id's, include labels to fully reconstruct catalogue
        const labels = included?.filter(isLabelItem).map((item) => item.id) ?? [];
        const attrs = included?.filter(isAttributeItem).map((item) => item.id) ?? [];
        const attributes = await this.fetchAttributes(attrs, labels);

        const metrics = (included ?? []).filter(isMetricItem).map((item) => convertMeasure(item));
        const facts = (included ?? []).filter(isFactItem).map(convertFact);

        return {
            insight,
            catalogItems: [...metrics, ...facts, ...attributes],
        };
    };

    private getInsightWithReferences = async (
        ref: ObjRef,
        references: EntitiesApiGetEntityVisualizationObjectsRequest["include"] = [],
    ): Promise<{
        insight: IInsight;
        included: JsonApiMetricOutIncludes[] | undefined;
    }> => {
        const id = await objRefToIdentifier(ref, this.authCall);
        const includeObj = references.length ? { include: references } : {};
        const response = await this.authCall((client) =>
            client.entities.getEntityVisualizationObjects(
                {
                    objectId: id,
                    workspaceId: this.workspace,
                    ...includeObj,
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

        return {
            insight,
            included,
        };
    };

    public getInsight = async (ref: ObjRef, options: IGetInsightOptions = {}): Promise<IInsight> => {
        const references = options?.loadUserData ? ["createdBy" as const, "modifiedBy" as const] : [];

        const { insight } = await this.getInsightWithReferences(ref, references);
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
