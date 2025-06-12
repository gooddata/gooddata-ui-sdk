// (C) 2021-2025 GoodData Corporation
import { isUriRef, ObjRef } from "@gooddata/sdk-model";
import isEmpty from "lodash/isEmpty.js";
import { MetadataGetEntitiesWorkspaceParams } from "@gooddata/api-client-tiger";
import { invariant } from "ts-invariant";

// Since tags can have spaces, need to parse this specific values to work with RSQL filtering. See https://github.com/jirutka/rsql-parser#grammar-and-semantic.
function parseTagsToRSQLFormat(tagsIdentifiers: string[]): string[] {
    return tagsIdentifiers.map((tag) => (tag.indexOf(" ") >= 0 ? `'${tag}'` : tag));
}

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
        const includeParsedTagsIdentifiers = parseTagsToRSQLFormat(includeTagsIdentifiers);
        rsqlFilterParts.push(`tags=in=(${includeParsedTagsIdentifiers.join(",")})`);
    }

    if (!isEmpty(excludeTags)) {
        const excludeTagsIdentifiers = tagsToIdentifiers(excludeTags);
        const excludeParsedTagsIdentifiers = parseTagsToRSQLFormat(excludeTagsIdentifiers);
        rsqlFilterParts.push(`tags=out=(${excludeParsedTagsIdentifiers.join(",")})`);
    }

    return rsqlAnd(...rsqlFilterParts);
}

export function searchToRsqlFilter({ search }: { search?: string }): string | undefined {
    if (search) {
        const escapedSearch = search.replace(/"/g, '\\"');
        return rsqlOr(`title=containsic="${escapedSearch}"`, `id=containsic="${escapedSearch}"`);
    }
    return undefined;
}

export function addRsqlFilterToParams<T extends MetadataGetEntitiesWorkspaceParams>(
    params: T,
    filter: string,
): T {
    if (isEmpty(filter)) {
        return params;
    }

    return {
        ...params,
        filter,
    };
}

export function rsqlAnd(...args: (string | undefined)[]) {
    return args.filter(Boolean).join(";");
}

export function rsqlOr(...args: (string | undefined)[]) {
    return args.filter(Boolean).join(",");
}

function tagsToIdentifiers(tags: ObjRef[]): string[] {
    return tags.map((ref) => {
        // Tags cannot be accessed by any separate endpoint, so it doesn't make sense to reference them by uri.
        // We will likely change the tag type signature from ObjRef to plain string in the future.
        invariant(!isUriRef(ref), "Tags cannot be referenced by uri!");
        return ref.identifier;
    });
}
