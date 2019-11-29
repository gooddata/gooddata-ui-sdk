// (C) 2019 GoodData Corporation
import flow from "lodash/flow";
import map from "lodash/fp/map";
import uniq from "lodash/fp/uniq";
import replace from "lodash/fp/replace";
import { IWorkspaceMetadata } from "@gooddata/sdk-backend-spi";
import { GdcVisualizationClass, GdcMetadata } from "@gooddata/gd-bear-model";
import {
    IVisualizationClass,
    IInsight,
    IAttributeDisplayForm,
    IMeasureExpressionToken,
} from "@gooddata/sdk-model";
import { AuthenticatedCallGuard } from "../commonTypes";
import { convertVisualizationClass } from "../toSdkModel/VisualizationClassConverter";
import { convertVisualization } from "../toSdkModel/VisualizationConverter";
import { tokenizeExpression, getTokenValuesOfType } from "./measureExpressionTokens";

export class BearWorkspaceMetadata implements IWorkspaceMetadata {
    constructor(private readonly authCall: AuthenticatedCallGuard, public readonly workspace: string) {}

    public getVisualizationClass = async (id: string): Promise<IVisualizationClass> => {
        const uri = await this.authCall(sdk => sdk.md.getObjectUri(this.workspace, id));
        const visClassResult = await this.authCall(
            sdk => sdk.md.getObjects(this.workspace, [uri]) as Promise<any>,
        );

        return convertVisualizationClass(visClassResult[0]);
    };

    public getVisualizationClasses = async (): Promise<IVisualizationClass[]> => {
        const visualizationClassesResult: GdcVisualizationClass.IVisualizationClassWrapped[] = await this.authCall(
            sdk =>
                sdk.md.getObjectsByQuery(this.workspace, {
                    category: "visualizationClass",
                }),
        );

        return visualizationClassesResult.map(convertVisualizationClass);
    };

    public getInsight = async (id: string): Promise<IInsight> => {
        const uri = await this.authCall(sdk => sdk.md.getObjectUri(this.workspace, id));
        const visualization = await this.authCall(sdk => sdk.md.getVisualization(uri));

        const visClassResult: any[] = await this.authCall(sdk =>
            sdk.md.getObjects(this.workspace, [
                visualization.visualizationObject.content.visualizationClass.uri,
            ]),
        );

        const visClass = visClassResult[0];
        const visualizationClassIdentifier = visClass.visualizationClass.meta.identifier;

        return convertVisualization(visualization, visualizationClassIdentifier);
    };

    public getAttributeDisplayForm = async (id: string): Promise<IAttributeDisplayForm> => {
        const displayFormUri = await this.authCall(sdk => sdk.md.getObjectUri(this.workspace, id));
        const displayFormDetails = await this.authCall(sdk => sdk.md.getObjectDetails(displayFormUri));

        return {
            attribute: {
                uri: displayFormDetails.attributeDisplayForm.content.formOf,
            },
            id: displayFormDetails.attributeDisplayForm.meta.identifier,
            title: displayFormDetails.attributeDisplayForm.meta.title,
        };
    };

    public async getMeasureExpressionTokens(identifier: string): Promise<IMeasureExpressionToken[]> {
        const metricMetadata = await this.authCall(sdk =>
            sdk.md.getObjectByIdentifier(this.workspace, identifier),
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
        const expressionIdentifierUrisPairs = await this.authCall(sdk =>
            sdk.md.getUrisFromIdentifiers(this.workspace, expressionIdentifiers),
        );
        const expressionIdentifierUris = expressionIdentifierUrisPairs.map(pair => pair.uri);
        const allExpressionElementAttributeUris = flow(
            map(replace(/\/elements\?id=.*/, "")),
            uniq,
        )(expressionElementUris);
        const allExpressionUris = uniq([
            ...expressionUris,
            ...expressionIdentifierUris,
            ...allExpressionElementAttributeUris,
        ]);
        const allExpressionWrappedObjects = await this.authCall(sdk =>
            sdk.md.getObjects(this.workspace, allExpressionUris),
        );
        const allExpressionObjects = allExpressionWrappedObjects.map(GdcMetadata.unwrapMetadataObject);
        const allExpressionElements = await Promise.all(
            expressionElementUris.map(elementUri =>
                this.authCall(sdk => sdk.md.getAttributeElementDefaultDisplayFormValue(elementUri)),
            ),
        );

        const objectByUri = allExpressionObjects.reduce((acc: { [key: string]: GdcMetadata.IObject }, el) => {
            return {
                ...acc,
                [el.meta.uri]: el,
            };
        }, {});

        const objectByIdentifier = allExpressionObjects.reduce(
            (acc: { [key: string]: GdcMetadata.IObject }, el) => {
                return {
                    ...acc,
                    [el.meta.identifier]: el,
                };
            },
            {},
        );

        const elementByUri = allExpressionElements.reduce(
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
                    return {
                        type: "attributeElement",
                        value: token.value,
                        element: elementByUri[token.value],
                    };
                } else if (token.type === "uri") {
                    return {
                        type: "metadataObject",
                        value: token.value,
                        meta: objectByUri[token.value].meta,
                    };
                } else if (token.type === "identifier") {
                    return {
                        type: "metadataObject",
                        value: token.value,
                        meta: objectByIdentifier[token.value].meta,
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
}
