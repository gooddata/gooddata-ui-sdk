// (C) 2026 GoodData Corporation

import {
    EntitiesApi_CreateEntityComputedAttributes,
    EntitiesApi_DeleteEntityComputedAttributes,
    EntitiesApi_GetEntityComputedAttributes,
    EntitiesApi_PatchEntityComputedAttributes,
    EntitiesApi_UpdateEntityComputedAttributes,
} from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import type {
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
    isIdentifierRef,
} from "@gooddata/sdk-model";

import { convertComputedAttributeFromBackend } from "../../../convertors/fromBackend/ComputedAttributeConverter.js";
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

    public getComputedAttributesQuery(): ComputedAttributesQuery {
        return new ComputedAttributesQuery(this.authCall, { workspaceId: this.workspace });
    }
}
