// (C) 2019-2022 GoodData Corporation
import { GdcMetadata, GdcMetadataObject } from "@gooddata/api-model-bear";
import {
    IMeasureExpressionToken,
    IMeasureReferencing,
    IWorkspaceMeasuresService,
} from "@gooddata/sdk-backend-spi";
import { IMeasureMetadataObject, IMeasureMetadataObjectDefinition, ObjRef } from "@gooddata/sdk-model";
import flow from "lodash/flow.js";
import map from "lodash/fp/map.js";
import replace from "lodash/fp/replace.js";
import uniq from "lodash/fp/uniq.js";
import {
    convertMetadataObject,
    SupportedMetadataObject,
    SupportedWrappedMetadataObject,
} from "../../../convertors/fromBackend/MetaConverter.js";
import {
    convertListedMetric,
    convertMetricFromBackend,
} from "../../../convertors/fromBackend/MetricConverter.js";
import { convertMetricToBackend } from "../../../convertors/toBackend/MetricConverter.js";
import { BearAuthenticatedCallGuard } from "../../../types/auth.js";
import { objRefToUri } from "../../../utils/api.js";
import { getTokenValuesOfType, tokenizeExpression, IExpressionToken } from "./measureExpressionTokens.js";
import { convertListedVisualization } from "../../../convertors/fromBackend/VisualizationConverter.js";

export class BearWorkspaceMeasures implements IWorkspaceMeasuresService {
    constructor(private readonly authCall: BearAuthenticatedCallGuard, public readonly workspace: string) {}

    public async getMeasureExpressionTokens(ref: ObjRef): Promise<IMeasureExpressionToken[]> {
        const uri = await objRefToUri(ref, this.workspace, this.authCall);
        const metricMetadata = await this.authCall((sdk) =>
            sdk.xhr.getParsed<GdcMetadataObject.WrappedObject>(uri),
        );

        if (!GdcMetadata.isWrappedMetric(metricMetadata)) {
            throw new Error(
                "To get measure expression tokens, provide the correct measure identifier. Did you provide a measure identifier?",
            );
        }

        const expressionTokens = tokenizeExpression(metricMetadata.metric.content.expression);
        const expressionIdentifiers = getTokenValuesOfType("identifier", expressionTokens);
        const expressionUris = getTokenValuesOfType("uri", expressionTokens);
        const expressionElementUris = getTokenValuesOfType("element_uri", expressionTokens);
        const expressionIdentifierUrisPairs = await this.authCall((sdk) =>
            sdk.md.getUrisFromIdentifiers(this.workspace, expressionIdentifiers),
        );
        const expressionIdentifierUris = expressionIdentifierUrisPairs.map((pair) => pair.uri);
        const allExpressionElementAttributeUris = flow(
            map(replace(/\/elements\?id=.*/, "")),
            uniq,
        )(expressionElementUris);
        const allExpressionUris = uniq([
            ...expressionUris,
            ...expressionIdentifierUris,
            ...allExpressionElementAttributeUris,
        ]);
        const allExpressionWrappedObjects = await this.authCall((sdk) =>
            sdk.md.getObjects<SupportedWrappedMetadataObject>(this.workspace, allExpressionUris),
        );
        const allExpressionObjects = allExpressionWrappedObjects.map(
            GdcMetadataObject.unwrapMetadataObject,
        ) as SupportedMetadataObject[];

        const allExpressionAttributeElements = await Promise.all(
            expressionElementUris.map((elementUri) =>
                this.authCall((sdk) => sdk.md.getAttributeElementDefaultDisplayFormValue(elementUri)),
            ),
        );

        const objectsByUri = allExpressionObjects.reduce(
            (acc: Record<string, GdcMetadataObject.IObject>, el) => {
                acc[el.meta.uri!] = el;
                return acc;
            },
            {},
        );

        const objectsByIdentifier = allExpressionObjects.reduce(
            (acc: Record<string, GdcMetadataObject.IObject>, el) => {
                acc[el.meta.identifier!] = el;
                return acc;
            },
            {},
        );

        const attributeElementsByUri = allExpressionAttributeElements.reduce(
            (acc: Record<string, GdcMetadata.IAttributeElement>, el) => {
                if (el) {
                    acc[el.uri] = el;
                }
                return acc;
            },
            {},
        );

        return expressionTokens.map((token): IMeasureExpressionToken => {
            if (token.type === "element_uri") {
                return createAttribute(attributeElementsByUri, token);
            }

            if (token.type === "uri" || token.type === "identifier") {
                return createIdentifier(token, objectsByUri, objectsByIdentifier);
            }

            if (
                token.type === "comment" ||
                token.type === "number" ||
                token.type === "quoted_text" ||
                token.type === "text" ||
                token.type === "bracket"
            ) {
                return createToken(token.type, token.value);
            }

            return createToken("text", token.value);
        });
    }

    async createMeasure(measure: IMeasureMetadataObjectDefinition): Promise<IMeasureMetadataObject> {
        const mdObject = await this.authCall((sdk) =>
            sdk.md.createObject(this.workspace, { metric: convertMetricToBackend(measure) }),
        );

        return convertMetricFromBackend(mdObject.metric);
    }

    async deleteMeasure(ref: ObjRef): Promise<void> {
        const uri = await objRefToUri(ref, this.workspace, this.authCall);
        await this.authCall((sdk) => sdk.md.deleteObject(uri));
    }

    async updateMeasure(measure: IMeasureMetadataObject): Promise<IMeasureMetadataObject> {
        const objectId = measure.uri.split("/").slice(-1)[0];
        await this.authCall((sdk) => {
            return sdk.md.updateObject(this.workspace, objectId, { metric: convertMetricToBackend(measure) });
        });

        return measure;
    }

    async getMeasureReferencingObjects(ref: ObjRef): Promise<IMeasureReferencing> {
        const uri = await objRefToUri(ref, this.workspace, this.authCall);

        const data = await this.authCall((sdk) =>
            sdk.md.getObjectUsedBy(this.workspace, uri, {
                types: ["metric", "visualizationObject"],
                nearest: true,
            }),
        );

        return Promise.resolve({
            measures: data.filter((item) => item.category === "metric").map(convertListedMetric),
            insights: data
                .filter((item) => item.category === "visualizationObject")
                .map(convertListedVisualization),
        });
    }
}

function createAttribute(
    attributeElementsByUri: { [p: string]: GdcMetadata.IAttributeElement },
    token: IExpressionToken,
): IMeasureExpressionToken {
    const element = attributeElementsByUri[token.value];
    return {
        type: "attributeElement",
        ...(element
            ? {
                  value: element.title,
              }
            : {
                  value: "",
                  deleted: true,
              }),
    };
}

function createIdentifier(
    token: IExpressionToken,
    objectsByUri: { [p: string]: GdcMetadataObject.IObject },
    objectsByIdentifier: { [p: string]: GdcMetadataObject.IObject },
): IMeasureExpressionToken {
    const meta =
        token.type === "uri"
            ? convertMetadataObject(objectsByUri[token.value])
            : convertMetadataObject(objectsByIdentifier[token.value]);
    return {
        type: meta.type,
        value: meta.title,
        id: meta.id,
        ref: meta.ref,
    };
}

function createToken<T>(type: T, value: string): { type: T; value: string } {
    return {
        type,
        value,
    };
}
