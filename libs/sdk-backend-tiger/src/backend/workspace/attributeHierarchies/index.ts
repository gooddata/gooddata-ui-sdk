// (C) 2023 GoodData Corporation
import { v4 as uuid } from "uuid";
import uniqBy from "lodash/uniqBy.js";
import flatMap from "lodash/flatMap.js";
import {
    AfmObjectIdentifierAttribute,
    JsonApiAttributeHierarchyInTypeEnum,
    jsonApiHeaders,
} from "@gooddata/api-client-tiger";
import { IAttributeHierarchiesService } from "@gooddata/sdk-backend-spi";
import { ICatalogAttributeHierarchy, ObjRef, objRefToString, serializeObjRef } from "@gooddata/sdk-model";

import { TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { toAttributeQualifier } from "../../../convertors/toBackend/ObjRefConverter.js";
import { toObjRef } from "../../../convertors/fromBackend/ObjRefConverter.js";
import { convertAttributeHierarchyWithoutLinks } from "../../../convertors/fromBackend/HierarchyConverter.js";

export class TigerAttributeHierarchiesService implements IAttributeHierarchiesService {
    private readonly authCall: TigerAuthenticatedCallGuard;
    private readonly workspace: string;

    constructor(authCall: TigerAuthenticatedCallGuard, workspace: string) {
        this.authCall = authCall;
        this.workspace = workspace;
    }

    public createAttributeHierarchy = async (
        title: string,
        attributeRefs: ObjRef[],
    ): Promise<ICatalogAttributeHierarchy> => {
        const attributeHierarchy = await this.authCall((client) => {
            const attributeHierarchyId = uuid();
            return client.entities.createEntityAttributeHierarchies(
                {
                    workspaceId: this.workspace,
                    jsonApiAttributeHierarchyInDocument: {
                        data: {
                            id: attributeHierarchyId,
                            type: JsonApiAttributeHierarchyInTypeEnum.ATTRIBUTE_HIERARCHY,
                            attributes: {
                                title: title,
                                content: {
                                    attributes: attributeRefs.map(this.objRefToObjIdentifier),
                                },
                            },
                        },
                    },
                },
                {
                    headers: jsonApiHeaders,
                },
            );
        });

        return convertAttributeHierarchyWithoutLinks(attributeHierarchy.data.data);
    };

    public updateAttributeHierarchy = async (
        catalogAttributeHierarchy: ICatalogAttributeHierarchy,
    ): Promise<ICatalogAttributeHierarchy> => {
        const { attributeHierarchy } = catalogAttributeHierarchy;
        await this.authCall((client) => {
            return client.entities.updateEntityAttributeHierarchies(
                {
                    objectId: attributeHierarchy.id,
                    workspaceId: this.workspace,
                    jsonApiAttributeHierarchyInDocument: {
                        data: {
                            id: attributeHierarchy.id,
                            type: JsonApiAttributeHierarchyInTypeEnum.ATTRIBUTE_HIERARCHY,
                            attributes: {
                                title: attributeHierarchy.title,
                                description: attributeHierarchy.description,
                                content: {
                                    attributes: attributeHierarchy.attributes.map(this.objRefToObjIdentifier),
                                },
                            },
                        },
                    },
                },
                {
                    headers: jsonApiHeaders,
                },
            );
        });

        return catalogAttributeHierarchy;
    };

    public deleteAttributeHierarchy = async (attributeHierarchyId: string): Promise<void> => {
        await this.authCall((client) => {
            return client.entities.deleteEntityAttributeHierarchies({
                objectId: attributeHierarchyId,
                workspaceId: this.workspace,
            });
        });
    };

    public getValidDescendants = async (attributes: ObjRef[]): Promise<ObjRef[]> => {
        const response = await this.authCall((client) =>
            client.validDescendants.computeValidDescendants({
                workspaceId: this.workspace,
                afmValidDescendantsQuery: {
                    attributes: attributes.map(toAttributeQualifier),
                },
            }),
        );

        const validDescendants = response.data.validDescendants;
        const result = flatMap(Object.keys(response.data.validDescendants), (it: string) => {
            const validAttributes: AfmObjectIdentifierAttribute[] = validDescendants[it];
            return validAttributes.map(toObjRef);
        });

        return Promise.resolve(uniqBy(result, serializeObjRef));
    };

    private objRefToObjIdentifier(ref: ObjRef) {
        return {
            identifier: {
                id: objRefToString(ref),
                type: "attribute",
            },
        };
    }
}
