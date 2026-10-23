// (C) 2021-2026 GoodData Corporation

import { type IMeasureMetadataObject } from "@gooddata/sdk-model";

import { type IMeasureDef } from "./metricHelpers.js";
import { addPrefixToId, hasDefinedPrefix, removePrefixFromId, replacePrefixInId } from "./prefixHelper.js";

export const sanitizeWhitespaces = /^\s+|\s+$/g;
export const sanitizeTitleSuffix = /\([0-9]+\)$/g;
export const sanitizeUnderscores = /^_+|_+$/g;
export const sanitizeSpecialCharacters = /[^.A-Za-z0-9_-]+/g;
export const sanitizeStart = /^\.+/g;
export const sanitizeDiacritic = /[\u0300-\u036f]/g;

export function generateUniqTitle(metric: IMeasureDef, metrics: IMeasureMetadataObject[] = []): string {
    const titles = metrics.map((m) => m.title);
    const currentTitle = metric?.title || "";
    if (!titles.includes(currentTitle)) {
        return currentTitle;
    }

    const baseTitle = getTitleWithoutSuffix(currentTitle);

    let index = 2;
    let newTitle = baseTitle;

    while (titles.includes(newTitle)) {
        newTitle = `${baseTitle} (${index})`;
        index++;
    }

    return newTitle;
}

function getTitleWithoutSuffix(title: string) {
    return title
        .replace(sanitizeWhitespaces, "")
        .replace(sanitizeTitleSuffix, "")
        .replace(sanitizeWhitespaces, "");
}

export function generateUniqId(
    title = "",
    prefix = "",
    metrics: IMeasureMetadataObject[] = [],
    parents: string[] = [],
): string {
    const ids = metrics.map((m) => m.id);
    const currentId = deriveIdFromTitle(title);

    return generateUniqIdByIds(prefix, currentId, ids, parents);
}

export function generateUniqIdByIds(
    prefix = "",
    id = "",
    ids: string[] = [],
    parents: string[] = [],
): string {
    const currentId = addPrefixToId(prefix, id);
    let index = 2;
    let newId = currentId;

    while (ids.includes(newId)) {
        newId = `${currentId}_${index}`;
        index++;
    }

    index = 1;
    while (parents.some((parent) => hasDefinedPrefix(parent, newId))) {
        parents.forEach((parent) => {
            if (hasDefinedPrefix(parent, newId)) {
                newId = replacePrefixInId(parent, newId, `${index}_${parent}`);
                index++;
            }
        });
    }

    return removePrefixFromId(prefix, newId);
}

export function deriveIdFromTitle(title = ""): string {
    return title
        .normalize("NFD")
        .replace(sanitizeDiacritic, "")
        .replace(sanitizeWhitespaces, "")
        .replace(sanitizeStart, "")
        .replace(sanitizeSpecialCharacters, "_")
        .replace(sanitizeUnderscores, "")
        .toLowerCase();
}
