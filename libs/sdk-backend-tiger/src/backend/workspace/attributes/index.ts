// (C) 2019-2021 GoodData Corporation
import {
    IAttributeDisplayFormMetadataObject,
    IAttributeMetadataObject,
    IElementsQueryFactory,
    IWorkspaceAttributesService,
    NotSupported,
} from "@gooddata/sdk-backend-spi";
import { areObjRefsEqual, isIdentifierRef, ObjRef } from "@gooddata/sdk-model";
import { TigerAuthenticatedCallGuard } from "../../../types";
import { TigerWorkspaceElements } from "./elements";
import { ITigerClient, jsonApiHeaders, MetadataUtilities } from "@gooddata/api-client-tiger";
import flatMap from "lodash/flatMap";
import {
    convertAttributesWithSideloadedLabels,
    convertAttributeWithSideloadedLabels,
    convertLabelWithSideloadedAttribute,
} from "../../../convertors/fromBackend/MetadataConverter";
import { invariant } from "ts-invariant";

export class TigerWorkspaceAttributes implements IWorkspaceAttributesService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {}

    public elements(): IElementsQueryFactory {
        return new TigerWorkspaceElements(this.authCall, this.workspace);
    }

    public getAttributeDisplayForm = async (ref: ObjRef): Promise<IAttributeDisplayFormMetadataObject> => {
        return this.authCall(async (client) => loadAttributeDisplayForm(client, this.workspace, ref));
    };

    public getAttribute = async (ref: ObjRef): Promise<IAttributeMetadataObject> => {
        return this.authCall(async (client) => loadAttribute(client, this.workspace, ref));
    };

    public getAttributeDisplayForms(refs: ObjRef[]): Promise<IAttributeDisplayFormMetadataObject[]> {
        return this.authCall(async (client) => {
            const allAttributes = await loadAttributes(client, this.workspace);

            return flatMap(allAttributes, (attr) => attr.displayForms).filter((df) =>
                refs.find((ref) => areObjRefsEqual(ref, df.ref)),
            );
        });
    }

    public getAttributes(refs: ObjRef[]): Promise<IAttributeMetadataObject[]> {
        return this.authCall(async (client) => {
            const allAttributes = await loadAttributes(client, this.workspace);

            return allAttributes.filter((attr) => refs.find((ref) => areObjRefsEqual(ref, attr.ref)));
        });
    }

    getCommonAttributes(): Promise<ObjRef[]> {
        throw new NotSupported("not supported");
    }

    getCommonAttributesBatch(): Promise<ObjRef[][]> {
        throw new NotSupported("not supported");
    }
}

function loadAttributeDisplayForm(
    client: ITigerClient,
    workspaceId: string,
    ref: ObjRef,
): Promise<IAttributeDisplayFormMetadataObject> {
    invariant(isIdentifierRef(ref), "tiger backend only supports referencing by identifier");

    return client.workspaceObjects
        .getEntityLabels(
            {
                workspaceId,
                objectId: ref.identifier,
            },
            {
                headers: jsonApiHeaders,
                params: {
                    include: "attributes",
                },
            },
        )
        .then((res) => convertLabelWithSideloadedAttribute(res.data));
}

function loadAttribute(
    client: ITigerClient,
    workspaceId: string,
    ref: ObjRef,
): Promise<IAttributeMetadataObject> {
    invariant(isIdentifierRef(ref), "tiger backend only supports referencing by identifier");

    return client.workspaceObjects
        .getEntityAttributes(
            {
                workspaceId,
                objectId: ref.identifier,
            },
            {
                headers: jsonApiHeaders,
                params: {
                    include: "labels",
                },
            },
        )
        .then((res) => convertAttributeWithSideloadedLabels(res.data));
}

function loadAttributes(client: ITigerClient, workspaceId: string): Promise<IAttributeMetadataObject[]> {
    return MetadataUtilities.getAllPagesOf(
        client,
        client.workspaceObjects.getAllEntitiesAttributes,
        { workspaceId },
        { query: { include: "labels" } },
    )
        .then(MetadataUtilities.mergeEntitiesResults)
        .then(convertAttributesWithSideloadedLabels);
}
