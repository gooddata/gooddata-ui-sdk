// (C) 2019-2023 GoodData Corporation
import {
    IWorkspaceMeasuresService,
    IMeasureExpressionToken,
    IMeasureReferencing,
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
} from "@gooddata/api-client-tiger";
import {
    ObjRef,
    idRef,
    isIdentifierRef,
    IMeasureMetadataObjectDefinition,
    IMeasureMetadataObject,
} from "@gooddata/sdk-model";
import { convertMetricFromBackend } from "../../../convertors/fromBackend/MetricConverter.js";
import { convertMetricToBackend } from "../../../convertors/toBackend/MetricConverter.js";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { objRefToIdentifier } from "../../../utils/api.js";
import { tokenizeExpression, IExpressionToken } from "./measureExpressionTokens.js";
import { visualizationObjectsItemToInsight } from "../../../convertors/fromBackend/InsightConverter.js";

export class TigerWorkspaceMeasures implements IWorkspaceMeasuresService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {}

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
            [tokenObjectType: string]: IMeasureExpressionToken["type"];
        }
        const typeMapping: ITypeMapping = {
            metric: "measure",
            fact: "fact",
            attribute: "attribute",
            label: "attribute",
            dataset: "dataSet",
        };

        const value = includedObject?.attributes?.title || `${objectType}/${objectId}`;
        return {
            type: typeMapping[objectType],
            value,
            id: objectId,
            ref: idRef(identifier),
        };
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

        return convertMetricFromBackend(result.data);
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

        return convertMetricFromBackend(result.data);
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
                .then((insights) => insights.data.map(visualizationObjectsItemToInsight)),
        );

        const measures = this.authCall((client) =>
            MetadataUtilities.getAllPagesOf(client, client.entities.getAllEntitiesMetrics, {
                workspaceId: this.workspace,
                include: ["metrics"],
                // return only measures that have a link to the given measure
                filter: `metrics.id==${id}`, // RSQL format of querying data
            })
                .then(MetadataUtilities.mergeEntitiesResults)
                .then((measures) => measures.data.map(convertMetricFromBackend)),
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
