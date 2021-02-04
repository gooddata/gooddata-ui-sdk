// (C) 2019-2021 GoodData Corporation
import { IWorkspaceMeasuresService, IMeasureExpressionToken } from "@gooddata/sdk-backend-spi";
import {
    JsonApiAttribute,
    JsonApiFact,
    JsonApiLabel,
    JsonApiMetric,
    JsonApiMetricDocument,
    jsonApiHeaders,
} from "@gooddata/api-client-tiger";
import { ObjRef, idRef, isIdentifierRef } from "@gooddata/sdk-model";
import { TigerAuthenticatedCallGuard } from "../../../types";
import { tokenizeExpression, IExpressionToken } from "./measureExpressionTokens";

export class TigerWorkspaceMeasures implements IWorkspaceMeasuresService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {}

    public async getMeasureExpressionTokens(ref: ObjRef): Promise<IMeasureExpressionToken[]> {
        if (!isIdentifierRef(ref)) {
            throw new Error("only identifiers supported");
        }

        const metricMetadata = await this.authCall((sdk) =>
            sdk.workspaceModel.getEntityMetrics(
                {
                    id: ref.identifier,
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
        metric: JsonApiMetricDocument,
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
        }) as JsonApiMetric | JsonApiLabel | JsonApiAttribute | JsonApiFact;

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
}
