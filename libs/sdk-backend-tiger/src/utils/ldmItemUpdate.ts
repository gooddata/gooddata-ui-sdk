// (C) 2025 GoodData Corporation

import {
    type DeclarativeAttribute,
    type DeclarativeFact,
    type ITigerClientBase,
} from "@gooddata/api-client-tiger";
import { LayoutApi_GetLogicalModel, LayoutApi_SetLogicalModel } from "@gooddata/api-client-tiger/layout";
import { UnexpectedResponseError } from "@gooddata/sdk-backend-spi";
import {
    type IMetadataObjectBase,
    type IMetadataObjectIdentity,
    type ObjRef,
    areObjRefsEqual,
} from "@gooddata/sdk-model";

/**
 * DO NOT USE THIS FUNCTION IN OTHER CASES
 * This is a hack function for updating attributes and facts metadata by using
 * declarative layout API. It is used in attributes and facts service. This is
 * very not performant and should be replaced as soon as possible.
 */
export async function ldmItemUpdate(
    client: ITigerClientBase,
    workspaceId: string,
    updated: Partial<IMetadataObjectBase> & IMetadataObjectIdentity,
) {
    const result = await LayoutApi_GetLogicalModel(client.axios, client.basePath, { workspaceId });

    const { ldm } = result.data;
    if (!ldm) {
        throw new UnexpectedResponseError("Logical model not found", result.status, result.data);
    }

    const dataset = ldm.datasets?.find((dataset) => {
        const attribute = dataset.attributes?.find((attribute) => {
            const attrRef: ObjRef = { type: "attribute", identifier: attribute.id };
            return updateItem(updated, attrRef, attribute);
        });
        const fact = dataset.facts?.find((fact) => {
            const factRef: ObjRef = { type: "fact", identifier: fact.id };
            return updateItem(updated, factRef, fact);
        });
        return attribute || fact;
    });
    if (!dataset) {
        throw new UnexpectedResponseError("Attribute or fact with provided ref not found", 404, updated.ref);
    }

    await LayoutApi_SetLogicalModel(client.axios, client.basePath, {
        workspaceId,
        declarativeModel: {
            ldm,
        },
    });
}

function updateItem(
    updated: Partial<IMetadataObjectBase> & IMetadataObjectIdentity,
    ref: ObjRef,
    item: DeclarativeAttribute | DeclarativeFact,
) {
    if (areObjRefsEqual(updated.ref, ref)) {
        if (updated.title !== undefined) {
            item.title = updated.title;
        }
        if (updated.description !== undefined) {
            item.description = updated.description;
        }
        if (updated.tags !== undefined) {
            item.tags = updated.tags;
        }
        if (updated.isHidden !== undefined) {
            item.isHidden = updated.isHidden;
        }
        return true;
    }
    return false;
}
