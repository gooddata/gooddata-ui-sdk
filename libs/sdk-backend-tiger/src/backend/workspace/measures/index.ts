// (C) 2019-2026 GoodData Corporation

import {
    type AfmValidObjectsQuery,
    type JsonApiAttributeOut,
    type JsonApiFactOut,
    type JsonApiLabelOut,
    type JsonApiMetricOut,
    type JsonApiMetricOutDocument,
    type KeyDriversDimension,
    MetadataUtilities,
} from "@gooddata/api-client-tiger";
import {
    EntitiesApi_CreateEntityMetrics,
    EntitiesApi_DeleteEntityMetrics,
    EntitiesApi_GetAllEntitiesMetrics,
    EntitiesApi_GetAllEntitiesVisualizationObjects,
    EntitiesApi_GetEntityMetrics,
    EntitiesApi_PatchEntityMetrics,
    EntitiesApi_UpdateEntityMetrics,
} from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import {
    SmartFunctionsApi_KeyDriverAnalysis,
    SmartFunctionsApi_KeyDriverAnalysisResult,
} from "@gooddata/api-client-tiger/endpoints/smartFunctions";
import { ActionsApi_ComputeValidObjects } from "@gooddata/api-client-tiger/endpoints/validObjects";
import type {
    IGetMeasureOptions,
    IMeasureExpressionToken,
    IMeasureKeyDrivers,
    IMeasureReferencing,
    IWorkspaceMeasuresService,
} from "@gooddata/sdk-backend-spi";
import {
    type IMeasure,
    type IMeasureMetadataObject,
    type IMeasureMetadataObjectDefinition,
    type IMetadataObjectBase,
    type IMetadataObjectIdentity,
    type ObjRef,
    type ObjectType,
    idRef,
    isIdentifierRef,
} from "@gooddata/sdk-model";

import { type IExpressionToken, tokenizeExpression } from "./measureExpressionTokens.js";
import { MeasuresQuery } from "./measuresQuery.js";
import { visualizationObjectsItemToInsight } from "../../../convertors/fromBackend/InsightConverter.js";
import { convertMetricFromBackend } from "../../../convertors/fromBackend/MetricConverter.js";
import { jsonApiIdToObjRef } from "../../../convertors/fromBackend/ObjRefConverter.js";
import { convertMeasure } from "../../../convertors/toBackend/afm/MeasureConverter.js";
import { convertMetricToBackend } from "../../../convertors/toBackend/MetricConverter.js";
import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { objRefToIdentifier } from "../../../utils/api.js";

const findDimensionality = (
    dims: KeyDriversDimension[],
    attributeId: string,
): KeyDriversDimension | undefined =>
    dims.find((dimensionality) => dimensionality.attribute.id === attributeId);

export class TigerWorkspaceMeasures implements IWorkspaceMeasuresService {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        public readonly workspace: string,
    ) {}

    public async computeKeyDrivers(
        measure: IMeasure,
        options?: { sortDirection: "ASC" | "DESC" },
    ): Promise<IMeasureKeyDrivers> {
        const sortDirection = options?.sortDirection;

        const keyDriverAnalysis = await this.authCall((client) =>
            SmartFunctionsApi_KeyDriverAnalysis(client.axios, client.basePath, {
                keyDriversRequest: {
                    metric: convertMeasure(measure),
                    sortDirection,
                },
                workspaceId: this.workspace,
            }),
        );

        const keyDriverResult = await this.authCall((client) =>
            SmartFunctionsApi_KeyDriverAnalysisResult(client.axios, client.basePath, {
                resultId: keyDriverAnalysis.data.links.executionResult,
                workspaceId: this.workspace,
            }),
        );

        const {
            effect: effects,
            label,
            labelElement,
        } = keyDriverResult.data.data as {
            effect: number[];
            label: string[];
            labelElement: string[];
        };

        const labels = label.map((attributeId, index) => {
            const dimensionality = findDimensionality(keyDriverAnalysis.data.dimensions, attributeId);
            const resolvedValue = dimensionality?.attributeName;
            return `${resolvedValue} (${labelElement[index]})`;
        });

        return {
            effects,
            labels,
        };
    }

    public async getMeasureExpressionTokens(ref: ObjRef): Promise<IMeasureExpressionToken[]> {
        if (!isIdentifierRef(ref)) {
            throw new Error("only identifiers supported");
        }

        const metricMetadata = await this.authCall((client) =>
            EntitiesApi_GetEntityMetrics(client.axios, client.basePath, {
                objectId: ref.identifier,
                workspaceId: this.workspace,
                include: ["facts", "metrics", "attributes", "labels", "datasets"],
            }),
        );
        const metric = metricMetadata.data;
        const maql = metric.data.attributes.content.maql || "";

        const regexTokens = tokenizeExpression(maql);
        return regexTokens.map((regexToken) => this.resolveToken(regexToken, metric));
    }

    private resolveToken(
        regexToken: IExpressionToken,
        metric: JsonApiMetricOutDocument,
    ): IMeasureExpressionToken {
        if (
            regexToken.type === "text" ||
            regexToken.type === "quoted_text" ||
            regexToken.type === "comment" ||
            regexToken.type === "number" ||
            regexToken.type === "bracket"
        ) {
            return { type: regexToken.type, value: regexToken.value };
        }
        const [type, id] = regexToken.value.split("/");
        if (
            type === "metric" ||
            type === "fact" ||
            type === "attribute" ||
            type === "label" ||
            type === "dataset"
        ) {
            return this.resolveObjectToken(id, type, metric.included || [], metric.data.id);
        }
        throw new Error(`Cannot resolve title of object type ${type}`);
    }

    private resolveObjectToken(
        objectId: string,
        objectType: "metric" | "fact" | "attribute" | "label" | "dataset",
        includedObjects: ReadonlyArray<any>,
        identifier: string,
    ): IMeasureExpressionToken {
        const includedObject = includedObjects.find((includedObject) => {
            return includedObject.id === objectId && includedObject.type === objectType;
        }) as JsonApiMetricOut | JsonApiLabelOut | JsonApiAttributeOut | JsonApiFactOut;

        interface ITypeMapping {
            [tokenObjectType: string]: ObjectType;
        }
        const typeMapping: ITypeMapping = {
            metric: "measure",
            fact: "fact",
            attribute: "attribute",
            label: "attribute",
            dataset: "dataSet",
        };

        const value = includedObject?.attributes?.title || `${objectType}/${objectId}`;
        const token: IMeasureExpressionToken = {
            type: typeMapping[objectType],
            value,
            id: objectId,
            ref: idRef(identifier),
        };

        return token;
    }

    async createMeasure(measure: IMeasureMetadataObjectDefinition): Promise<IMeasureMetadataObject> {
        const metricAttributes = convertMetricToBackend(measure);
        const result = await this.authCall((client) => {
            return EntitiesApi_CreateEntityMetrics(client.axios, client.basePath, {
                workspaceId: this.workspace,
                jsonApiMetricPostOptionalIdDocument: {
                    data: {
                        id: measure.id,
                        type: "metric",
                        attributes: metricAttributes,
                    },
                },
            });
        });

        return convertMetricFromBackend(result.data, result.data.included);
    }

    async updateMeasure(measure: IMeasureMetadataObject): Promise<IMeasureMetadataObject> {
        const objectId = objRefToIdentifier(measure.ref, this.authCall);
        const metricAttributes = convertMetricToBackend(measure);
        const result = await this.authCall((client) => {
            return EntitiesApi_UpdateEntityMetrics(client.axios, client.basePath, {
                objectId,
                workspaceId: this.workspace,
                jsonApiMetricInDocument: {
                    data: {
                        id: objectId,
                        type: "metric",
                        attributes: metricAttributes,
                    },
                },
            });
        });

        return convertMetricFromBackend(result.data, result.data.included);
    }

    async updateMeasureMeta(
        measure: Partial<IMetadataObjectBase> & IMetadataObjectIdentity,
    ): Promise<IMeasureMetadataObject> {
        const objectId = objRefToIdentifier(measure.ref, this.authCall);
        const result = await this.authCall((client) => {
            return EntitiesApi_PatchEntityMetrics(client.axios, client.basePath, {
                objectId,
                workspaceId: this.workspace,
                jsonApiMetricPatchDocument: {
                    data: {
                        id: objectId,
                        type: "metric",
                        attributes: {
                            ...(measure.title === undefined ? {} : { title: measure.title }),
                            ...(measure.description === undefined
                                ? {}
                                : { description: measure.description }),
                            ...(measure.tags === undefined ? {} : { tags: measure.tags }),
                            ...(measure.isHidden === undefined ? {} : { isHidden: measure.isHidden }),
                        },
                    },
                },
            });
        });

        return convertMetricFromBackend(result.data, result.data.included);
    }

    async deleteMeasure(measureRef: ObjRef): Promise<void> {
        const objectId = objRefToIdentifier(measureRef, this.authCall);

        await this.authCall((client) => {
            return EntitiesApi_DeleteEntityMetrics(client.axios, client.basePath, {
                objectId,
                workspaceId: this.workspace,
            });
        });
    }

    public getMeasureReferencingObjects = async (ref: ObjRef): Promise<IMeasureReferencing> => {
        const id = objRefToIdentifier(ref, this.authCall);

        const insights = this.authCall((client) =>
            MetadataUtilities.getAllPagesOf(client, EntitiesApi_GetAllEntitiesVisualizationObjects, {
                workspaceId: this.workspace,
                // return only visualizationObjects that have a link to the given measure
                filter: `metrics.id==${id}`, // RSQL format of querying data
            })
                .then(MetadataUtilities.mergeEntitiesResults)
                .then((insights) =>
                    insights.data.map((insight) =>
                        visualizationObjectsItemToInsight(insight, insights.included),
                    ),
                ),
        );

        const measures = this.authCall((client) =>
            MetadataUtilities.getAllPagesOf(client, EntitiesApi_GetAllEntitiesMetrics, {
                workspaceId: this.workspace,
                include: ["metrics"],
                // return only measures that have a link to the given measure
                filter: `metrics.id==${id}`, // RSQL format of querying data
            })
                .then(MetadataUtilities.mergeEntitiesResults)
                .then((measures) =>
                    measures.data.map((metric) => convertMetricFromBackend(metric, measures.included)),
                ),
        );

        const request = Promise.all([insights, measures]);
        return request.then(([insights, measures]) => {
            return {
                insights,
                measures,
            };
        });
    };

    public getMeasuresQuery(): MeasuresQuery {
        return new MeasuresQuery(this.authCall, { workspaceId: this.workspace });
    }

    public async getMeasure(ref: ObjRef, options: IGetMeasureOptions = {}): Promise<IMeasureMetadataObject> {
        const id = objRefToIdentifier(ref, this.authCall);
        const result = await this.authCall((client) =>
            EntitiesApi_GetEntityMetrics(client.axios, client.basePath, {
                objectId: id,
                workspaceId: this.workspace,
                include: options.loadUserData ? ["createdBy", "modifiedBy"] : [],
            }),
        );

        return convertMetricFromBackend(result.data, result.data.included);
    }

    public async getConnectedAttributes(definition: IMeasure, auxMeasures?: IMeasure[]): Promise<ObjRef[]> {
        const measureItem = convertMeasure(definition);

        const afmValidObjectsQuery: AfmValidObjectsQuery = {
            types: ["attributes"],
            afm: {
                attributes: [],
                measures: [measureItem],
                filters: [],
                auxMeasures: auxMeasures?.map(convertMeasure),
            },
        };

        const connectedItemsResponse = await this.authCall((client) =>
            ActionsApi_ComputeValidObjects(client.axios, client.basePath, {
                workspaceId: this.workspace,
                afmValidObjectsQuery,
            }),
        );

        return connectedItemsResponse.data.items
            .filter((item) => item.type === "attribute")
            .map(jsonApiIdToObjRef);
    }
}
