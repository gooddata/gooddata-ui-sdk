// (C) 2021 GoodData Corporation
import { isUriRef, ObjRef } from "@gooddata/sdk-model";
import isEmpty from "lodash/isEmpty";
import { MetadataGetEntitiesParams } from "@gooddata/api-client-tiger";
import invariant from "ts-invariant";

export function tagsToRsqlFilter({
    includeTags,
    excludeTags,
}: {
    includeTags: ObjRef[];
    excludeTags: ObjRef[];
}): string {
    const rsqlFilterParts = [];

    if (!isEmpty(includeTags)) {
        const includeTagsIdentifiers = tagsToIdentifiers(includeTags);
        rsqlFilterParts.push(`tags=in=(${includeTagsIdentifiers.join(",")})`);
    }

    if (!isEmpty(excludeTags)) {
        const excludeTagsIdentifiers = tagsToIdentifiers(excludeTags);
        rsqlFilterParts.push(`tags=out=(${excludeTagsIdentifiers.join(",")})`);
    }

    return rsqlFilterParts.join(";");
}

export function addRsqlFilterToParams(
    params: MetadataGetEntitiesParams,
    filter: string,
): MetadataGetEntitiesParams {
    if (isEmpty(filter)) {
        return params;
    }

    return {
        ...params,
        filter,
    };
}

function tagsToIdentifiers(tags: ObjRef[]): string[] {
    return tags.map((ref) => {
        // Tags cannot be accessed by any separate endpoint, so it doesn't make sense to reference them by uri.
        // We will likely change the tag type signature from ObjRef to plain string in the future.
        invariant(!isUriRef(ref), "Tags cannot be referenced by uri!");
        return ref.identifier;
    });
}
