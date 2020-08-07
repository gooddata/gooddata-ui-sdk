// (C) 2019-2020 GoodData Corporation
import { IWorkspaceMetadata } from "@gooddata/sdk-backend-spi";
import {
    MetricResourceResponseSchema,
    MetricResourceSchema,
    AttributeResourceSchema,
    FactResourceSchema,
    LabelResourceSchema,
    SuccessIncluded,
} from "@gooddata/api-client-tiger";
import { AxiosResponse } from "axios";
import {
    IAttributeDisplayFormMetadataObject,
    IMeasureExpressionToken,
    ObjRef,
    newAttributeDisplayFormMetadataObject,
    idRef,
    IMetadataObject,
    newDataSetMetadataObject,
    IAttributeMetadataObject,
    newAttributeMetadataObject,
    isIdentifierRef,
} from "@gooddata/sdk-model";
import { TigerAuthenticatedCallGuard } from "../../../types";
import { tokenizeExpression, IExpressionToken } from "./measureExpressionTokens";

export class TigerWorkspaceMetadata implements IWorkspaceMetadata {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {}

    public getAttributeDisplayForm = async (ref: ObjRef): Promise<IAttributeDisplayFormMetadataObject> => {
        return this.authCall(async () =>
            newAttributeDisplayFormMetadataObject(ref, (df) =>
                df.title("Display form").attribute(idRef("attr.dummy")),
            ),
        );
    };

    public getAttribute = async (ref: ObjRef): Promise<IAttributeMetadataObject> => {
        return this.authCall(async () => newAttributeMetadataObject(ref, (att) => att.title("dummyTitle")));
    };

    public async getMeasureExpressionTokens(ref: ObjRef): Promise<IMeasureExpressionToken[]> {
        if (!isIdentifierRef(ref)) {
            throw new Error("only identifiers supported");
        }

        const metricMetadata = await this.authCall((sdk) =>
            sdk.metadata.metricsIdGet({
                contentType: "application/json",
                id: ref.identifier,
                include: "facts,metrics,attributes,labels",
            }),
        );
        const maql = metricMetadata.data.data.attributes.maql || "";

        const regexTokens = tokenizeExpression(maql);
        return regexTokens.map((regexToken) => this.resolveToken(regexToken, metricMetadata));
    }

    public async getFactDatasetMeta(_ref: ObjRef): Promise<IMetadataObject> {
        return newDataSetMetadataObject(idRef("dummyDataset"), (m) =>
            m.id("dummyDataset").uri("/dummy/dataset").title("Dummy dataset").description(""),
        );
    }

    private resolveToken(
        regexToken: IExpressionToken,
        metricMetadata: AxiosResponse<MetricResourceResponseSchema>,
    ): IMeasureExpressionToken {
        if (regexToken.type === "text" || regexToken.type === "quoted_text") {
            return { type: "text", value: regexToken.value };
        }
        const [type, id] = regexToken.value.split("/");
        if (type === "metric" || type === "fact" || type === "attribute" || type === "label") {
            return this.resolveObjectToken(
                id,
                type,
                metricMetadata.data.included || [],
                metricMetadata.data.data.id,
            );
        }
        throw new Error(`Cannot resolve title of object type ${type}`);
    }

    private resolveObjectToken(
        objectId: string,
        objectType: "metric" | "fact" | "attribute" | "label",
        includedObjects: ReadonlyArray<SuccessIncluded>,
        identifier: string,
    ): IMeasureExpressionToken {
        const includedObject = includedObjects.find((includedObject) => {
            return includedObject.id === objectId && includedObject.type === objectType;
        }) as MetricResourceSchema | LabelResourceSchema | AttributeResourceSchema | FactResourceSchema;

        interface ITypeMapping {
            [tokenObjectType: string]: IMeasureExpressionToken["type"];
        }
        const typeMapping: ITypeMapping = {
            metric: "measure",
            fact: "fact",
            attribute: "attribute",
            label: "attribute",
        };

        const value = includedObject?.attributes.title || `${objectType}/${objectId}`;
        return {
            type: typeMapping[objectType],
            value,
            ref: idRef(identifier),
        };
    }
}
