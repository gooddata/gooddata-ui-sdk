// (C) 2019-2023 GoodData Corporation
import {
    IInsightsQueryOptions,
    IInsightsQueryResult,
    IInsightReferences,
    IInsightReferencing,
    IWorkspaceInsightsService,
    SupportedInsightReferenceTypes,
    UnexpectedError,
    NotSupported,
    IGetInsightOptions,
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
    insightUpdated,
    insightTags,
    insightSummary,
} from "@gooddata/sdk-model";
import sortBy from "lodash/sortBy.js";
import {
    jsonApiHeaders,
    MetadataUtilities,
    VisualizationObjectModelV1,
    VisualizationObjectModelV2,
    JsonApiVisualizationObjectInTypeEnum,
    ValidateRelationsHeader,
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
        if (options?.loadUserData) {
            throw new NotSupported(
                "Tiger backend does not support the 'loadUserData' option of getInsights.",
            );
        }

        const orderBy = options?.orderBy;
        const usesOrderingByUpdated = !orderBy || orderBy === "updated";

        const allInsights = await this.authCall((client) => {
            return MetadataUtilities.getAllPagesOf(
                client,
                client.entities.getAllEntitiesVisualizationObjects,
                { workspaceId: this.workspace, ...(usesOrderingByUpdated ? {} : { sort: [orderBy!] }) },
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
                            .map(visualizationObjectsItemToInsight);
                    }
                    return res.data.map(visualizationObjectsItemToInsight);
                });
        });

        // tiger does not support the "updated" property of the metadata objects at the moment
        // -> fall back to title ordering in a future-compatible way if "updated" ordering was requested
        let sanitizedOrder = allInsights;
        if (usesOrderingByUpdated && allInsights.length > 0) {
            // tiger started sending "updated" property -> use it to sort
            if (insightUpdated(allInsights[0])) {
                sanitizedOrder = sortBy(allInsights, (insight) => insightUpdated(insight));
            }
            // tiger still does not support the "updated" property -> sort by title
            else {
                sanitizedOrder = sortBy(allInsights, (insight) => insightTitle(insight).toUpperCase());
            }
        }

        return new InMemoryPaging(sanitizedOrder, options?.limit ?? 50, options?.offset ?? 0);
    };

    public getInsight = async (ref: ObjRef, options: IGetInsightOptions = {}): Promise<IInsight> => {
        if (options.loadUserData) {
            throw new NotSupported("Tiger backend does not support the 'loadUserData' option of getInsight.");
        }
        const id = await objRefToIdentifier(ref, this.authCall);
        const response = await this.authCall((client) =>
            client.entities.getEntityVisualizationObjects(
                {
                    objectId: id,
                    workspaceId: this.workspace,
                },
                {
                    headers: jsonApiHeaders,
                },
            ),
        );
        const { data: visualizationObject, links } = response.data;
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
