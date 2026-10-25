// (C) 2007-2026 GoodData Corporation

import { type IAttributeElement } from "@gooddata/sdk-model";

/** The read surface of a raw attribute element; `available` is an AD-side decoration. */
interface IRawAttributeElement {
    uri?: string;
    title?: string;
    /** the backend's display form of a date attribute value (`title` is the raw value, e.g. "01") */
    formattedTitle?: string;
    available?: boolean;
}

export interface IDecoratedAttributeElement {
    uri: string | null;
    title: string | null;
    /** present only for elements the backend formatted (date attribute values) */
    formattedTitle?: string;
    original: unknown;
    id: number | null;
    available: boolean;
}

function getIdFromUri(uri: string) {
    const match = uri.match(/\?id=(.*)/);
    return match && parseInt(match[1], 10);
}

export function getId(element: IRawAttributeElement | undefined): number {
    const uri = element?.uri || "";
    return getIdFromUri(uri);
}

export function getIdFromElement(item: IAttributeElement): number {
    const uri = item.uri || "";
    return getIdFromUri(uri);
}

function isAvailable(element: IRawAttributeElement | undefined): boolean {
    return element?.available !== false;
}

export function decoratedAttributeElement(
    element: IRawAttributeElement | undefined,
): IDecoratedAttributeElement {
    return {
        uri: element?.uri ?? null,
        title: element?.title ?? null,
        ...(element?.formattedTitle ? { formattedTitle: element.formattedTitle } : {}),
        original: element ?? null,
        id: getId(element),
        available: isAvailable(element),
    };
}
