// (C) 2019-2021 GoodData Corporation
import {
    IWorkspaceMeasuresService,
    IMeasureExpressionToken,
    IMeasureMetadataObject,
} from "@gooddata/sdk-backend-spi";
import {
    JsonApiAttributeOut,
    JsonApiFactOut,
    JsonApiLabelOut,
    JsonApiMetricOut,
    JsonApiMetricOutDocument,
    jsonApiHeaders,
    JsonApiMetricInTypeEnum,
} from "@gooddata/api-client-tiger";
import { IMeasureMetadataObjectDefinition } from "@gooddata/sdk-backend-spi";
import { ObjRef, idRef, isIdentifierRef } from "@gooddata/sdk-model";
import { convertMetricFromBackend } from "../../../convertors/fromBackend/MetricConverter";
import { convertMetricToBackend } from "../../../convertors/toBackend/MetricConverter";
import { TigerAuthenticatedCallGuard } from "../../../types";
import { objRefToIdentifier } from "../../../utils/api";
import { tokenizeExpression, IExpressionToken } from "./measureExpressionTokens";
import { v4 as uuidv4 } from "uuid";

export class TigerWorkspaceMeasures implements IWorkspaceMeasuresService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {}

    public async getMeasureExpressionTokens(ref: ObjRef): Promise<IMeasureExpressionToken[]> {
        if (!isIdentifierRef(ref)) {
            throw new Error("only identifiers supported");
        }

        const metricMetadata = await this.authCall((client) =>
            client.workspaceObjects.getEntityMetrics(
                {
                    objectId: ref.identifier,
                    workspaceId: this.workspace,
                },
                {
                    headers: jsonApiHeaders,
                    query: { include: "facts,metrics,attributes,labels" },
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
        if (regexToken.type === "text" || regexToken.type === "quoted_text") {
            return { type: "text", value: regexToken.value };
        }
        const [type, id] = regexToken.value.split("/");
        if (type === "metric" || type === "fact" || type === "attribute" || type === "label") {
            return this.resolveObjectToken(id, type, metric.included || [], metric.data.id);
        }
        throw new Error(`Cannot resolve title of object type ${type}`);
    }

    private resolveObjectToken(
        objectId: string,
        objectType: "metric" | "fact" | "attribute" | "label",
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
        };

        const value = includedObject?.attributes?.title || `${objectType}/${objectId}`;
        return {
            type: typeMapping[objectType],
            value,
            ref: idRef(identifier),
        };
    }

    async createMeasure(measure: IMeasureMetadataObjectDefinition): Promise<IMeasureMetadataObject> {
        const metricAttributes = convertMetricToBackend(measure);
        const result = await this.authCall((client) => {
            return client.workspaceObjects.createEntityMetrics(
                {
                    workspaceId: this.workspace,
                    jsonApiMetricInDocument: {
                        data: {
                            id: measure.id || uuidv4(),
                            type: JsonApiMetricInTypeEnum.Metric,
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
            return client.workspaceObjects.updateEntityMetrics(
                {
                    objectId,
                    workspaceId: this.workspace,
                    jsonApiMetricInDocument: {
                        data: {
                            id: objectId,
                            type: JsonApiMetricInTypeEnum.Metric,
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
            return client.workspaceObjects.deleteEntityMetrics({
                objectId,
                workspaceId: this.workspace,
            });
        });
    }
}
