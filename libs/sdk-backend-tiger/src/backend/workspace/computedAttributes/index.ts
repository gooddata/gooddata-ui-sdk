// (C) 2026 GoodData Corporation

import { uniqBy } from "lodash-es";

import { MetadataUtilities } from "@gooddata/api-client-tiger";
import {
    DashboardsApi_GetAllEntitiesAnalyticalDashboards,
    EntitiesApi_CreateEntityComputedAttributes,
    EntitiesApi_DeleteEntityComputedAttributes,
    EntitiesApi_GetAllEntitiesMetrics,
    EntitiesApi_GetAllEntitiesVisualizationObjects,
    EntitiesApi_GetEntityComputedAttributes,
    EntitiesApi_PatchEntityComputedAttributes,
    EntitiesApi_UpdateEntityComputedAttributes,
} from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import type {
    IComputedAttributeReferencing,
    IGetComputedAttributeOptions,
    IMeasureExpressionToken,
    IWorkspaceComputedAttributesService,
} from "@gooddata/sdk-backend-spi";
import {
    type IComputedAttributeMetadataObject,
    type IComputedAttributeMetadataObjectDefinition,
    type IMetadataObjectBase,
    type IMetadataObjectIdentity,
    type ObjRef,
    insightId,
    isIdentifierRef,
} from "@gooddata/sdk-model";

import { convertComputedAttributeFromBackend } from "../../../convertors/fromBackend/ComputedAttributeConverter.js";
import { visualizationObjectsItemToInsight } from "../../../convertors/fromBackend/InsightConverter.js";
import { convertAnalyticalDashboardWithLinks } from "../../../convertors/fromBackend/MetadataConverter.js";
import { convertMetricFromBackend } from "../../../convertors/fromBackend/MetricConverter.js";
import { convertComputedAttributeToBackend } from "../../../convertors/toBackend/ComputedAttributeConverter.js";
import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { objRefToIdentifier } from "../../../utils/api.js";
import { resolveExpressionToken, tokenizeExpression } from "../measures/measureExpressionTokens.js";

import { ComputedAttributesQuery } from "./computedAttributesQuery.js";

export class TigerWorkspaceComputedAttributes implements IWorkspaceComputedAttributesService {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        public readonly workspace: string,
    ) {}

    async createComputedAttribute(
        computedAttribute: IComputedAttributeMetadataObjectDefinition,
    ): Promise<IComputedAttributeMetadataObject> {
        const attributes = convertComputedAttributeToBackend(computedAttribute);
        const result = await this.authCall((client) => {
            return EntitiesApi_CreateEntityComputedAttributes(client.axios, client.basePath, {
                workspaceId: this.workspace,
                jsonApiComputedAttributePostOptionalIdDocument: {
                    data: {
                        id: computedAttribute.id,
                        type: "computedAttribute",
                        attributes,
                    },
                },
            });
        });

        return convertComputedAttributeFromBackend(result.data, result.data.included);
    }

    async updateComputedAttribute(
        computedAttribute: IComputedAttributeMetadataObject,
    ): Promise<IComputedAttributeMetadataObject> {
        const objectId = objRefToIdentifier(computedAttribute.ref, this.authCall);
        const attributes = convertComputedAttributeToBackend(computedAttribute);
        const result = await this.authCall((client) => {
            return EntitiesApi_UpdateEntityComputedAttributes(client.axios, client.basePath, {
                objectId,
                workspaceId: this.workspace,
                jsonApiComputedAttributeInDocument: {
                    data: {
                        id: objectId,
                        type: "computedAttribute",
                        attributes,
                    },
                },
            });
        });

        return convertComputedAttributeFromBackend(result.data, result.data.included);
    }

    async updateComputedAttributeMeta(
        computedAttribute: Partial<IMetadataObjectBase> & IMetadataObjectIdentity,
    ): Promise<IComputedAttributeMetadataObject> {
        const objectId = objRefToIdentifier(computedAttribute.ref, this.authCall);
        const result = await this.authCall((client) => {
            return EntitiesApi_PatchEntityComputedAttributes(client.axios, client.basePath, {
                objectId,
                workspaceId: this.workspace,
                jsonApiComputedAttributePatchDocument: {
                    data: {
                        id: objectId,
                        type: "computedAttribute",
                        attributes: {
                            ...(computedAttribute.title === undefined
                                ? {}
                                : { title: computedAttribute.title }),
                            ...(computedAttribute.description === undefined
                                ? {}
                                : { description: computedAttribute.description }),
                            ...(computedAttribute.tags === undefined ? {} : { tags: computedAttribute.tags }),
                            ...(computedAttribute.isHidden === undefined
                                ? {}
                                : { isHidden: computedAttribute.isHidden }),
                        },
                    },
                },
            });
        });

        return convertComputedAttributeFromBackend(result.data, result.data.included);
    }

    async deleteComputedAttribute(ref: ObjRef): Promise<void> {
        const objectId = objRefToIdentifier(ref, this.authCall);

        await this.authCall((client) => {
            return EntitiesApi_DeleteEntityComputedAttributes(client.axios, client.basePath, {
                objectId,
                workspaceId: this.workspace,
            });
        });
    }

    public async getComputedAttribute(
        ref: ObjRef,
        options: IGetComputedAttributeOptions = {},
    ): Promise<IComputedAttributeMetadataObject> {
        const id = objRefToIdentifier(ref, this.authCall);
        const result = await this.authCall((client) =>
            EntitiesApi_GetEntityComputedAttributes(client.axios, client.basePath, {
                objectId: id,
                workspaceId: this.workspace,
                include: options.loadUserData ? ["createdBy", "modifiedBy"] : [],
            }),
        );

        return convertComputedAttributeFromBackend(result.data, result.data.included);
    }

    public async getComputedAttributeExpressionTokens(ref: ObjRef): Promise<IMeasureExpressionToken[]> {
        if (!isIdentifierRef(ref)) {
            throw new Error("only identifiers supported");
        }

        const result = await this.authCall((client) =>
            EntitiesApi_GetEntityComputedAttributes(client.axios, client.basePath, {
                objectId: ref.identifier,
                workspaceId: this.workspace,
                include: [
                    "facts",
                    "metrics",
                    "attributes",
                    "labels",
                    "datasets",
                    "parameters",
                    "computedAttributes",
                ],
            }),
        );

        const computedAttribute = result.data;
        const maql = computedAttribute.data.attributes.content.maql || "";

        return tokenizeExpression(maql).map((regexToken) =>
            resolveExpressionToken(regexToken, computedAttribute.included ?? [], computedAttribute.data.id),
        );
    }

    public async getComputedAttributeReferencingObjects(ref: ObjRef): Promise<IComputedAttributeReferencing> {
        const id = objRefToIdentifier(ref, this.authCall);

        // Visualizations grouping by the computed attribute, metrics that reference it, and
        // dashboards that filter by it or embed those visualizations. The backend allows the
        // delete; the catalog refuses it and lists these titles instead.
        const insights = this.authCall((client) =>
            MetadataUtilities.getAllPagesOf(client, EntitiesApi_GetAllEntitiesVisualizationObjects, {
                workspaceId: this.workspace,
                filter: `computedAttributes.id==${id}`,
            })
                .then(MetadataUtilities.mergeEntitiesResults)
                .then((visualizationObjects) =>
                    visualizationObjects.data.map((visualizationObject) =>
                        visualizationObjectsItemToInsight(visualizationObject, visualizationObjects.included),
                    ),
                ),
        );

        const measures = this.authCall((client) =>
            MetadataUtilities.getAllPagesOf(client, EntitiesApi_GetAllEntitiesMetrics, {
                workspaceId: this.workspace,
                include: ["computedAttributes"],
                filter: `computedAttributes.id==${id}`,
            })
                .then(MetadataUtilities.mergeEntitiesResults)
                .then((metrics) =>
                    metrics.data.map((metric) => convertMetricFromBackend(metric, metrics.included)),
                ),
        );

        const [insightList, measureList] = await Promise.all([insights, measures]);

        const dashboardFilterParts = [`labels.id==${id}`];
        if (insightList.length > 0) {
            const insightIds = insightList.map((insight) => `"${insightId(insight)}"`).join(",");
            dashboardFilterParts.push(`visualizationObjects.id=in=(${insightIds})`);
        }

        const analyticalDashboards = await this.authCall((client) =>
            MetadataUtilities.getAllPagesOf(client, DashboardsApi_GetAllEntitiesAnalyticalDashboards, {
                workspaceId: this.workspace,
                filter: dashboardFilterParts.join(","),
            })
                .then(MetadataUtilities.mergeEntitiesResults)
                .then((dashboards) =>
                    uniqBy(
                        dashboards.data.map((dashboard) => convertAnalyticalDashboardWithLinks(dashboard)),
                        (dashboard) => dashboard.id,
                    ),
                ),
        );

        return { insights: insightList, measures: measureList, analyticalDashboards };
    }

    public getComputedAttributesQuery(): ComputedAttributesQuery {
        return new ComputedAttributesQuery(this.authCall, { workspaceId: this.workspace });
    }
}
