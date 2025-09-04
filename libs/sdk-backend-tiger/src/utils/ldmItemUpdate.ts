// (C) 2025 GoodData Corporation
import { DeclarativeAttribute, DeclarativeFact, ITigerClient } from "@gooddata/api-client-tiger";
import { UnexpectedResponseError } from "@gooddata/sdk-backend-spi";
import { IMetadataObjectBase, IMetadataObjectIdentity, ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";

/**
 * DO NOT USE THIS FUNCTION IN OTHER CASES
 * This is a hack function for updating attributes and facts metadata by using
 * declarative layout API. It is used in attributes and facts service. This is
 * very not performant and should be replaced as soon as possible.
 */
export async function ldmItemUpdate(
    client: ITigerClient,
    workspaceId: string,
    updated: Partial<IMetadataObjectBase> & IMetadataObjectIdentity,
) {
    const result = await client.declarativeLayout.getLogicalModel({ workspaceId });

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

    await client.declarativeLayout.setLogicalModel({
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
        if (updated.title) {
            item.title = updated.title;
        }
        if (updated.description) {
            item.description = updated.description;
        }
        if (updated.tags) {
            item.tags = updated.tags;
        }
        return true;
    }
    return false;
}
