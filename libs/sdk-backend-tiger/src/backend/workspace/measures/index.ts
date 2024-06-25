// (C) 2019-2024 GoodData Corporation
import {
    IWorkspaceMeasuresService,
    IMeasureExpressionToken,
    IMeasureReferencing,
    IMeasureKeyDrivers,
} from "@gooddata/sdk-backend-spi";
import {
    JsonApiAttributeOut,
    JsonApiFactOut,
    JsonApiLabelOut,
    JsonApiMetricOut,
    JsonApiMetricOutDocument,
    jsonApiHeaders,
    JsonApiMetricInTypeEnum,
    MetadataUtilities,
    KeyDriversDimension,
} from "@gooddata/api-client-tiger";
import {
    ObjRef,
    idRef,
    isIdentifierRef,
    IMeasureMetadataObjectDefinition,
    IMeasureMetadataObject,
    IMeasure,
    ObjectType,
} from "@gooddata/sdk-model";
import { convertMetricFromBackend } from "../../../convertors/fromBackend/MetricConverter.js";
import { convertMetricToBackend } from "../../../convertors/toBackend/MetricConverter.js";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { objRefToIdentifier } from "../../../utils/api.js";
import { tokenizeExpression, IExpressionToken } from "./measureExpressionTokens.js";
import { visualizationObjectsItemToInsight } from "../../../convertors/fromBackend/InsightConverter.js";
import { convertMeasure } from "../../../convertors/toBackend/afm/MeasureConverter.js";

const findDimensionality = (
    dims: KeyDriversDimension[],
    attributeId: string,
): KeyDriversDimension | undefined =>
    dims.find((dimensionality) => dimensionality.attribute.id === attributeId);

export class TigerWorkspaceMeasures implements IWorkspaceMeasuresService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {}

    public async computeKeyDrivers(
        measure: IMeasure,
        options?: { sortDirection: "ASC" | "DESC" },
    ): Promise<IMeasureKeyDrivers> {
        const sortDirection = options?.sortDirection;

        const keyDriverAnalysis = await this.authCall((client) =>
            client.smartFunctions.keyDriverAnalysis({
                keyDriversRequest: {
                    metric: convertMeasure(measure),
                    sortDirection,
                },
                workspaceId: this.workspace,
            }),
        );

        const keyDriverResult = await this.authCall((client) =>
            client.smartFunctions.keyDriverAnalysisResult({
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
            client.entities.getEntityMetrics(
                {
                    objectId: ref.identifier,
                    workspaceId: this.workspace,
                    include: ["facts", "metrics", "attributes", "labels", "datasets"],
                },
                {
                    headers: jsonApiHeaders,
                },
            ),
        );
        const metric = metricMetadata.data;
        const maql = metric.data.attributes!.content!.maql || "";

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
            return client.entities.createEntityMetrics(
                {
                    workspaceId: this.workspace,
                    jsonApiMetricPostOptionalIdDocument: {
                        data: {
                            id: measure.id,
                            type: JsonApiMetricInTypeEnum.METRIC,
                            attributes: metricAttributes,
                        },
                    },
                },
                {
                    headers: jsonApiHeaders,
                },
            );
        });

        return convertMetricFromBackend(result.data, result.data.included);
    }

    async updateMeasure(measure: IMeasureMetadataObject): Promise<IMeasureMetadataObject> {
        const objectId = await objRefToIdentifier(measure.ref, this.authCall);
        const metricAttributes = convertMetricToBackend(measure);
        const result = await this.authCall((client) => {
            return client.entities.updateEntityMetrics(
                {
                    objectId,
                    workspaceId: this.workspace,
                    jsonApiMetricInDocument: {
                        data: {
                            id: objectId,
                            type: JsonApiMetricInTypeEnum.METRIC,
                            attributes: metricAttributes,
                        },
                    },
                },
                {
                    headers: jsonApiHeaders,
                },
            );
        });

        return convertMetricFromBackend(result.data, result.data.included);
    }

    async deleteMeasure(measureRef: ObjRef): Promise<void> {
        const objectId = await objRefToIdentifier(measureRef, this.authCall);

        await this.authCall((client) => {
            return client.entities.deleteEntityMetrics({
                objectId,
                workspaceId: this.workspace,
            });
        });
    }

    public getMeasureReferencingObjects = async (ref: ObjRef): Promise<IMeasureReferencing> => {
        const id = await objRefToIdentifier(ref, this.authCall);

        const insights = this.authCall((client) =>
            MetadataUtilities.getAllPagesOf(client, client.entities.getAllEntitiesVisualizationObjects, {
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
            MetadataUtilities.getAllPagesOf(client, client.entities.getAllEntitiesMetrics, {
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
}
