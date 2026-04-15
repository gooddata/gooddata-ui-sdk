// (C) 2026 GoodData Corporation

import { type IAnalyticalBackend, isUnexpectedResponseError } from "@gooddata/sdk-backend-spi";
import type { IParameterMetadataObjectDefinition } from "@gooddata/sdk-model";

import { createParameterCatalogItem } from "../catalogItem/query.js";

const canonicalUuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const trailingCopySuffixRegex = /^(.*) \((\d+)\)$/;

export async function createCopiedParameterCatalogItem(
    backend: IAnalyticalBackend,
    workspace: string,
    parameter: IParameterMetadataObjectDefinition,
    initialCopiedId: string | undefined,
) {
    try {
        return await createParameterCatalogItem(backend, workspace, parameter);
    } catch (error) {
        if (!parameter.id || parameter.id !== initialCopiedId || !isDuplicateIdError(error)) {
            throw error;
        }
        const { id: _id, ...parameterWithoutId } = parameter;
        return createParameterCatalogItem(backend, workspace, parameterWithoutId);
    }
}

export function createCopiedParameter(
    parameter: IParameterMetadataObjectDefinition,
): IParameterMetadataObjectDefinition {
    const { id: _id, title: _title, ...parameterRest } = parameter;
    const title = getCopiedTitle(parameter.title);
    const id = shouldOmitCopiedId(parameter.id) ? undefined : getCopiedId(title);
    return {
        ...(id === undefined ? {} : { id }),
        ...(title === undefined ? {} : { title }),
        ...parameterRest,
    };
}

function getCopiedTitle(title: string | undefined): string | undefined {
    if (title === undefined) {
        return undefined;
    }
    if (title === "") {
        return "";
    }
    const match = title.match(trailingCopySuffixRegex);
    if (match) {
        const [, prefix, suffix] = match;
        return `${prefix} (${Number(suffix) + 1})`;
    }
    return `${title} (2)`;
}

function shouldOmitCopiedId(id: string | undefined): boolean {
    return id === undefined || isCanonicalUuid(id);
}

function getCopiedId(title: string | undefined): string | undefined {
    if (!title) {
        return undefined;
    }
    const normalizedTitle = title
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\W/g, "_")
        .toLowerCase();
    return normalizedTitle || undefined;
}

function isCanonicalUuid(value: string): boolean {
    return canonicalUuidRegex.test(value);
}

function isDuplicateIdError(error: unknown): boolean {
    return error instanceof Error && isUnexpectedResponseError(error) && error.httpStatus === 409;
}
