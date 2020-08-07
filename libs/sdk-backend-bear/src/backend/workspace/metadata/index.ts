// (C) 2019-2020 GoodData Corporation
import flow from "lodash/flow";
import map from "lodash/fp/map";
import uniq from "lodash/fp/uniq";
import replace from "lodash/fp/replace";
import invariant from "ts-invariant";
import { IWorkspaceMetadata } from "@gooddata/sdk-backend-spi";
import { GdcMetadata, GdcMetadataObject } from "@gooddata/api-model-bear";
import {
    IAttributeDisplayFormMetadataObject,
    IMeasureExpressionToken,
    IMetadataObject,
    newAttributeDisplayFormMetadataObject,
    ObjRef,
    uriRef,
    IAttributeMetadataObject,
    newAttributeMetadataObject,
} from "@gooddata/sdk-model";
import { getTokenValuesOfType, tokenizeExpression } from "./measureExpressionTokens";
import { BearAuthenticatedCallGuard } from "../../../types/auth";
import {
    convertMetadataObject,
    convertMetadataObjectXrefEntry,
    SupportedMetadataObject,
    SupportedWrappedMetadataObject,
} from "../../../convertors/fromBackend/MetaConverter";
import { getObjectIdFromUri, objRefToUri } from "../../../utils/api";

export class BearWorkspaceMetadata implements IWorkspaceMetadata {
    constructor(private readonly authCall: BearAuthenticatedCallGuard, public readonly workspace: string) {}

    public getAttributeDisplayForm = async (ref: ObjRef): Promise<IAttributeDisplayFormMetadataObject> => {
        const displayFormUri = await objRefToUri(ref, this.workspace, this.authCall);
        const wrappedDisplayForm: GdcMetadata.IWrappedAttributeDisplayForm = await this.authCall((sdk) =>
            sdk.md.getObjectDetails(displayFormUri),
        );
        const displayFormDetails = wrappedDisplayForm.attributeDisplayForm;

        const attrRef = uriRef(displayFormDetails.content.formOf);

        return newAttributeDisplayFormMetadataObject(ref, (df) =>
            df
                .attribute(attrRef)
                .title(displayFormDetails.meta.title)
                .description(displayFormDetails.meta.summary)
                .id(displayFormDetails.meta.identifier)
                .uri(displayFormDetails.meta.uri),
        );
    };

    public getAttribute = async (ref: ObjRef): Promise<IAttributeMetadataObject> => {
        const attributeUri = await objRefToUri(ref, this.workspace, this.authCall);
        const wrappedAttribute: GdcMetadata.IWrappedAttribute = await this.authCall((sdk) =>
            sdk.md.getObjectDetails(attributeUri),
        );
        const { title, uri, isProduction, identifier, summary } = wrappedAttribute.attribute.meta;
        const { displayForms } = wrappedAttribute.attribute.content;
        const attributeDisplayForms = displayForms.map((displayForm) =>
            newAttributeDisplayFormMetadataObject(uriRef(displayForm.meta.uri), (df) =>
                df
                    .attribute(ref)
                    .title(displayForm.meta.title)
                    .description(displayForm.meta.summary)
                    .id(displayForm.meta.identifier)
                    .uri(displayForm.meta.uri)
                    .displayFormType(displayForm.content.type),
            ),
        );

        return newAttributeMetadataObject(ref, (a) =>
            a
                .title(title)
                .uri(uri)
                .production(Boolean(isProduction))
                .id(identifier)
                .description(summary)
                .displayForms(attributeDisplayForms),
        );
    };

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
            (acc: { [key: string]: GdcMetadataObject.IObject }, el) => {
                return {
                    ...acc,
                    [el.meta.uri]: el,
                };
            },
            {},
        );

        const objectsByIdentifier = allExpressionObjects.reduce(
            (acc: { [key: string]: GdcMetadataObject.IObject }, el) => {
                return {
                    ...acc,
                    [el.meta.identifier]: el,
                };
            },
            {},
        );

        const attributeElementsByUri = allExpressionAttributeElements.reduce(
            (acc: { [key: string]: GdcMetadata.IAttributeElement }, el) => {
                if (!el) {
                    return acc;
                }
                return {
                    ...acc,
                    [el.uri]: el,
                };
            },
            {},
        );

        const expressionTokensWithDetails = expressionTokens.map(
            (token): IMeasureExpressionToken => {
                if (token.type === "element_uri") {
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
                } else if (token.type === "uri" || token.type === "identifier") {
                    const meta =
                        token.type === "uri"
                            ? convertMetadataObject(objectsByUri[token.value])
                            : convertMetadataObject(objectsByIdentifier[token.value]);
                    return {
                        type: meta.type,
                        value: meta.title,
                        ref: meta.ref,
                    };
                }

                return {
                    type: "text",
                    value: token.value,
                };
            },
        );

        return expressionTokensWithDetails;
    }

    public async getFactDatasetMeta(ref: ObjRef): Promise<IMetadataObject> {
        const uri = await objRefToUri(ref, this.workspace, this.authCall);
        const objectId = getObjectIdFromUri(uri);

        return this.authCall(async (sdk) => {
            const usedBy = await sdk.xhr.getParsed<{ entries: GdcMetadata.IObjectXrefEntry[] }>(
                `/gdc/md/${this.workspace}/usedby2/${objectId}?types=dataSet`,
            );

            invariant(usedBy.entries.length > 0, "Fact must have a dataset associated to it.");

            return convertMetadataObjectXrefEntry("dataSet", usedBy.entries[0]);
        });
    }
}
