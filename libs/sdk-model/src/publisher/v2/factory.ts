// (C) 2026 GoodData Corporation

import { invariant } from "ts-invariant";

import { type ObjRef, isIdentifierRef } from "../../objRef/index.js";

import { type IPublisherDocumentPageV2, type IPublisherPageBodyV2 } from "./page.js";

/**
 * Generates an id such as `widget_7f3a91c4`.
 *
 * @remarks
 * For a valid id, the prefix uses only `[A-Za-z0-9_.-]`, has at most 55 characters and does not
 * start with `default.`.
 *
 * @alpha
 */
export function newPublisherIdV2(prefix: string): string {
    const bytes = crypto.getRandomValues(new Uint8Array(4));
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    return `${prefix}_${hex}`;
}

/**
 * Generates a page id such as `page_7f3a91c4`.
 *
 * @alpha
 */
export function newPublisherPageIdV2(): string {
    return newPublisherIdV2("page");
}

/**
 * Generates a section id such as `section_7f3a91c4`.
 *
 * @alpha
 */
export function newPublisherSectionIdV2(): string {
    return newPublisherIdV2("section");
}

/**
 * Generates a widget id such as `widget_7f3a91c4`.
 *
 * @alpha
 */
export function newPublisherWidgetIdV2(): string {
    return newPublisherIdV2("widget");
}

/**
 * @alpha
 */
export interface INewPublisherDocumentFilterIdOptionsV2 {
    /**
     * The label of an attribute filter or the dataset of a date filter, as an identifier ref.
     */
    target: ObjRef;
    /**
     * Local identifiers of the document's `content.filters`.
     */
    usedIds: ReadonlySet<string>;
}

const maxIdLength = 64;

/**
 * Generates a document filter id such as `document_filter_region_name`.
 *
 * @remarks
 * Every character of the target's identifier outside `[A-Za-z0-9_]` becomes `_`, and the id is cut to
 * 64 characters. When the document already uses the id, `_2`, `_3` and so on is appended, with the
 * base shortened so the id stays within 64 characters.
 *
 * Throws when the target is not an identifier ref.
 *
 * @alpha
 */
export function newPublisherDocumentFilterIdV2({
    target,
    usedIds,
}: INewPublisherDocumentFilterIdOptionsV2): string {
    invariant(isIdentifierRef(target), "A document filter id needs an identifier ref as its target.");
    const base = `document_filter_${target.identifier.replace(/[^A-Za-z0-9_]/g, "_")}`;
    for (let attempt = 1; ; attempt++) {
        const suffix = attempt === 1 ? "" : `_${attempt}`;
        const id = base.slice(0, maxIdLength - suffix.length) + suffix;
        if (!usedIds.has(id)) {
            return id;
        }
    }
}

/**
 * Copies a page template's content into a new document page.
 *
 * @remarks
 * The page is a deep copy with its own page id. Widget ids stay as written, so pages made from
 * one template share widget ids; a widget is addressed by page id plus widget id.
 *
 * A document page can be passed as the template: its `id` is replaced and its `visible` is dropped.
 *
 * @alpha
 */
export function newPublisherDocumentPageFromTemplateV2(
    body: IPublisherPageBodyV2 & Partial<Pick<IPublisherDocumentPageV2, "id" | "visible">>,
    id: string = newPublisherPageIdV2(),
): IPublisherDocumentPageV2 {
    const { id: _id, visible: _visible, ...content } = structuredClone(body);
    return { ...content, id };
}
