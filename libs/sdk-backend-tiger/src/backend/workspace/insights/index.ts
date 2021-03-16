// (C) 2019-2021 GoodData Corporation
import {
    IInsightsQueryOptions,
    IInsightsQueryResult,
    IInsightReferences,
    IInsightReferencing,
    IWorkspaceInsightsService,
    SupportedInsightReferenceTypes,
    UnexpectedError,
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
} from "@gooddata/sdk-model";
import { v4 as uuidv4 } from "uuid";
import {
    VisualizationObjectModel,
    jsonApiHeaders,
    MetadataUtilities,
    MetadataGetEntitiesOptions,
} from "@gooddata/api-client-tiger";
import {
    insightFromInsightDefinition,
    visualizationObjectsItemToInsight,
} from "../../../convertors/fromBackend/InsightConverter";

import { TigerAuthenticatedCallGuard } from "../../../types";
import { objRefToUri, objRefToIdentifier } from "../../../utils/api";
import { convertVisualizationObject } from "../../../convertors/fromBackend/VisualizationObjectConverter";
import { convertInsight } from "../../../convertors/toBackend/InsightConverter";

import { visualizationClasses as visualizationClassesMocks } from "./mocks/visualizationClasses";
import { InMemoryPaging } from "@gooddata/sdk-backend-base";

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
        const orderBy = options?.orderBy;
        const optionsToUse: MetadataGetEntitiesOptions = {
            query: {
                ...(orderBy !== "updated" ? { sort: orderBy } : {}),
            },
        };

        const allInsights = await this.authCall((client) => {
            return MetadataUtilities.getAllPagesOf(
                client,
                client.workspaceObjects.getEntitiesVisualizationObjects,
                { workspaceId: this.workspace },
                optionsToUse,
            )
                .then(MetadataUtilities.mergeEntitiesResults)
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

        return new InMemoryPaging(allInsights, options?.limit ?? 50, 0);
    };

    public getInsight = async (ref: ObjRef): Promise<IInsight> => {
        const id = await objRefToIdentifier(ref, this.authCall);
        const response = await this.authCall((sdk) =>
            sdk.workspaceObjects.getEntityVisualizationObjects(
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
                visualizationObject.attributes!.content! as VisualizationObjectModel.IVisualizationObject,
            ),
            visualizationObject.id,
            links!.self,
        );

        if (!insight) {
            throw new UnexpectedError(`Insight for ${objRefToString(ref)} not found!`);
        }

        return insight;
    };

    public createInsight = async (insight: IInsightDefinition): Promise<IInsight> => {
        const createResponse = await this.authCall((sdk) => {
            return sdk.workspaceObjects.createEntityVisualizationObjects(
                {
                    workspaceId: this.workspace,
                    jsonApiVisualizationObjectDocument: {
                        data: {
                            id: uuidv4(),
                            type: "visualizationObject",
                            attributes: {
                                description: insightTitle(insight),
                                content: convertInsight(insight),
                                title: insightTitle(insight),
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
        return insightFromInsightDefinition(insight, insightData.data.id, insightData.links!.self);
    };

    public updateInsight = async (insight: IInsight): Promise<IInsight> => {
        await this.authCall((sdk) => {
            return sdk.workspaceObjects.updateEntityVisualizationObjects(
                {
                    objectId: insightId(insight),
                    workspaceId: this.workspace,
                    jsonApiVisualizationObjectDocument: {
                        data: {
                            id: insightId(insight),
                            type: "visualizationObject",
                            attributes: {
                                description: insightTitle(insight),
                                content: convertInsight(insight),
                                title: insightTitle(insight),
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

        await this.authCall((sdk) =>
            sdk.workspaceObjects.deleteEntityVisualizationObjects({
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

    public getInsightReferencingObjects = async (_ref: ObjRef): Promise<IInsightReferencing> => {
        return Promise.resolve({});
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
