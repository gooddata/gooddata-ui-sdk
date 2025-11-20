// (C) 2023-2025 GoodData Corporation

import { uniqBy } from "lodash-es";
import { v4 as uuid } from "uuid";

import { AfmObjectIdentifierAttribute, jsonApiHeaders } from "@gooddata/api-client-tiger";
import {
    EntitiesApi_CreateEntityAttributeHierarchies,
    EntitiesApi_DeleteEntityAttributeHierarchies,
    EntitiesApi_UpdateEntityAttributeHierarchies,
} from "@gooddata/api-client-tiger/entitiesObjects";
import { ValidDescendantsApi_ComputeValidDescendants } from "@gooddata/api-client-tiger/validDescendants";
import { IAttributeHierarchiesService } from "@gooddata/sdk-backend-spi";
import {
    ICatalogAttributeHierarchy,
    IDateHierarchyTemplate,
    ObjRef,
    idRef,
    objRefToString,
    serializeObjRef,
} from "@gooddata/sdk-model";

import { convertAttributeHierarchyWithoutLinks } from "../../../convertors/fromBackend/HierarchyConverter.js";
import { toObjRef } from "../../../convertors/fromBackend/ObjRefConverter.js";
import { toAttributeQualifier } from "../../../convertors/toBackend/ObjRefConverter.js";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";

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
            return EntitiesApi_CreateEntityAttributeHierarchies(
                client.axios,
                client.basePath,
                {
                    workspaceId: this.workspace,
                    jsonApiAttributeHierarchyInDocument: {
                        data: {
                            id: attributeHierarchyId,
                            type: "attributeHierarchy",
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
            return EntitiesApi_UpdateEntityAttributeHierarchies(
                client.axios,
                client.basePath,
                {
                    objectId: attributeHierarchy.id,
                    workspaceId: this.workspace,
                    jsonApiAttributeHierarchyInDocument: {
                        data: {
                            id: attributeHierarchy.id,
                            type: "attributeHierarchy",
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
            return EntitiesApi_DeleteEntityAttributeHierarchies(client.axios, client.basePath, {
                objectId: attributeHierarchyId,
                workspaceId: this.workspace,
            });
        });
    };

    public getValidDescendants = async (attributes: ObjRef[]): Promise<ObjRef[]> => {
        const response = await this.authCall((client) =>
            ValidDescendantsApi_ComputeValidDescendants(client.axios, client.basePath, {
                workspaceId: this.workspace,
                afmValidDescendantsQuery: {
                    attributes: attributes.map(toAttributeQualifier),
                },
            }),
        );

        const validDescendants = response.data.validDescendants;
        const result = Object.keys(response.data.validDescendants).flatMap((it: string) => {
            const validAttributes: AfmObjectIdentifierAttribute[] = validDescendants[it];
            return validAttributes.map(toObjRef);
        });

        return Promise.resolve(uniqBy(result, serializeObjRef));
    };

    public getDateHierarchyTemplates(): Promise<IDateHierarchyTemplate[]> {
        return Promise.resolve([
            {
                type: "dateHierarchyTemplate",
                ref: idRef("default", "dateHierarchyTemplate"),
                id: "default",
                uri: "/default",
                title: "Year, quarter, month, date, hour, minute",
                granularities: [
                    "GDC.time.year",
                    "GDC.time.quarter",
                    "GDC.time.month",
                    "GDC.time.date",
                    "GDC.time.hour",
                    "GDC.time.minute",
                ],
                description: "Default hierarchy template for date dataset",
                production: true,
                deprecated: false,
                unlisted: false,
            },
        ]);
    }

    private objRefToObjIdentifier(ref: ObjRef) {
        return {
            identifier: {
                id: objRefToString(ref),
                type: "attribute",
            },
        };
    }
}
