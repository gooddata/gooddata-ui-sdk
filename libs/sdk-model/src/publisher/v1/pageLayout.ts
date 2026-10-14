// (C) 2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import { type IAuditableDates, type IAuditableUsers } from "../../base/metadata.js";
import { type FilterContextItem } from "../../dashboard/filterContext.js";
import { type ObjRef, isObjRef } from "../../objRef/index.js";

import {
    type PublisherPageLayoutNodeV1,
    isPublisherLayoutSectionV1,
    isPublisherLayoutSlotRefV1,
} from "./layout.js";
import { type PublisherPageFormatV1, isPublisherPageFormatV1 } from "./pageFormat.js";
import { type PublisherSlotV1, isPublisherImageSlotV1, isPublisherTextSlotV1 } from "./slot.js";
import { type IPublisherBoxStyleV1, isPublisherImageBackgroundV1 } from "./styling.js";

/**
 * Body of a document page: geometry (flex split tree) plus the slots it places.
 *
 * @remarks
 * This is both the content of the standalone {@link IPublisherPageLayoutV1} object and the shape
 * embedded in template/document content ({@link IPublisherDocumentPageV1}).
 *
 * There is no header/footer chrome: page title, description, footer, page numbers and
 * logos are ordinary slots in the layout tree (text slots with `{currentPageNumber}`/`{totalPages}`,
 * an image slot with `{logo}`). Every slot fills its layout area completely.
 *
 * @alpha
 */
export interface IPublisherPageBodyV1 {
    /**
     * Editor hint only (template galleries, default styling, AI context).
     * Renderers must not branch layout logic on it — geometry always comes from `layout`.
     */
    kind?: "cover" | "section" | "content";

    /**
     * Page proportions the layout was authored for. Defaults to
     * {@link DefaultPublisherPageFormatV1}.
     */
    format?: PublisherPageFormatV1;

    /**
     * Paint of the page itself, behind everything the layout places.
     */
    style?: IPublisherBoxStyleV1;

    /**
     * Root of the page layout tree.
     */
    layout: PublisherPageLayoutNodeV1;

    /**
     * All slots referenced by the layout, flat, keyed by localIdentifier.
     */
    slots: PublisherSlotV1[];

    /**
     * Page-level filters: merged over content-level filters (a filter targeting the
     * same object replaces the inherited one); slot filters apply on top.
     */
    filters?: FilterContextItem[];
}

/**
 * Stored content of the reportPage entity.
 *
 * @alpha
 */
export interface IPublisherPageLayoutContentV1 extends IPublisherPageBodyV1 {
    /**
     * Content model version, for stored-content evolution.
     */
    version: "1";
}

/**
 * Payload for creating or updating a page layout.
 *
 * @alpha
 */
export interface IPublisherPageLayoutDefinitionV1 {
    type: "reportPageLayout";

    /**
     * Present when updating an existing page.
     */
    ref?: ObjRef;

    title: string;

    description?: string;

    tags?: string[];

    content: IPublisherPageLayoutContentV1;
}

/**
 * Reusable page layout metadata object.
 *
 * @alpha
 */
export interface IPublisherPageLayoutV1
    extends IPublisherPageLayoutDefinitionV1, IAuditableDates, IAuditableUsers {
    ref: ObjRef;

    /**
     * When true, the object comes from a parent workspace and is not editable
     * in the current workspace.
     */
    isLocked?: boolean;

    /**
     * Predefined page shipped with the product, populated by the SPI. Never sent to or
     * stored on the backend; UI must disable deletion and editing of built-in pages.
     */
    isBuiltIn?: boolean;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IPublisherPageLayoutDefinitionV1}.
 *
 * @alpha
 */
export function isPublisherPageLayoutDefinitionV1(obj: unknown): obj is IPublisherPageLayoutDefinitionV1 {
    return !isEmpty(obj) && (obj as IPublisherPageLayoutDefinitionV1).type === "reportPageLayout";
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IPublisherPageLayoutV1}.
 *
 * @alpha
 */
export function isPublisherPageLayoutV1(obj: unknown): obj is IPublisherPageLayoutV1 {
    return isPublisherPageLayoutDefinitionV1(obj) && isObjRef((obj as IPublisherPageLayoutV1).ref);
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IPublisherPageLayoutContentV1}.
 *
 * @alpha
 */
export function isPublisherPageLayoutContentV1(obj: unknown): obj is IPublisherPageLayoutContentV1 {
    return (
        !isEmpty(obj) &&
        (obj as IPublisherPageLayoutContentV1).version === "1" &&
        !isEmpty((obj as IPublisherPageLayoutContentV1).layout) &&
        Array.isArray((obj as IPublisherPageLayoutContentV1).slots)
    );
}

/**
 * Validation issue found in a page body.
 *
 * @alpha
 */
export interface IPublisherPageBodyValidationIssueV1 {
    severity: "error" | "warning";
    message: string;
}

/**
 * Validates the structural invariants of a page body beyond what its types guarantee for content
 * arriving from the wire: the page format is known, slot localIdentifiers are unique, layout
 * weights are positive, corner radii and paddings are finite and not negative, every slot is placed (by the
 * layout, or as the image background of a box that renders), every layout slotId resolves
 * (unresolved ones are warnings — they render as empty areas), and background references
 * resolve to image slots.
 *
 * @alpha
 */
export function validatePublisherPageBodyV1(
    body: IPublisherPageBodyV1,
): IPublisherPageBodyValidationIssueV1[] {
    const issues: IPublisherPageBodyValidationIssueV1[] = [];

    if (body.format !== undefined && !isPublisherPageFormatV1(body.format)) {
        issues.push({ severity: "error", message: `Unknown page format "${body.format}".` });
    }

    const checkLength = (name: string, value: number | undefined): void => {
        if (value !== undefined && !(Number.isFinite(value) && value >= 0)) {
            issues.push({
                severity: "error",
                message: `${name} must be a finite non-negative number, got ${value}.`,
            });
        }
    };

    const slotIds = new Set<string>();
    for (const slot of body.slots) {
        if (slotIds.has(slot.localIdentifier)) {
            issues.push({
                severity: "error",
                message: `Duplicate slot localIdentifier "${slot.localIdentifier}".`,
            });
        }
        slotIds.add(slot.localIdentifier);
    }

    const slotsById = new Map(body.slots.map((slot) => [slot.localIdentifier, slot]));
    const backgroundIds = new Set<string>();
    const checkBoxStyle = (style: IPublisherBoxStyleV1 | undefined, isDrawn: boolean): void => {
        checkLength("Border radius", style?.borderRadius);
        checkLength("Padding", style?.padding);
        if (!style?.background || !isPublisherImageBackgroundV1(style.background)) {
            return;
        }
        const { slotId } = style.background;
        const slot = slotsById.get(slotId);
        if (slot === undefined) {
            issues.push({
                severity: "warning",
                message: `Background references slot "${slotId}" which has no definition; no background renders.`,
            });
            return;
        }
        if (!isPublisherImageSlotV1(slot)) {
            issues.push({
                severity: "error",
                message: `Background references slot "${slotId}" which is not an image slot.`,
            });
            return;
        }
        if (isDrawn) {
            backgroundIds.add(slotId);
        }
    };
    checkBoxStyle(body.style, true);

    const referencedIds = new Set<string>();
    const visit = (node: PublisherPageLayoutNodeV1): void => {
        if (node.weight !== undefined && !(node.weight > 0)) {
            issues.push({
                severity: "error",
                message: `Layout node weight must be positive, got ${node.weight}.`,
            });
        }
        if (isPublisherLayoutSlotRefV1(node)) {
            referencedIds.add(node.slotId);
            if (!slotIds.has(node.slotId)) {
                issues.push({
                    severity: "warning",
                    message: `Layout references slot "${node.slotId}" which has no definition; it renders empty.`,
                });
            }
        } else if (isPublisherLayoutSectionV1(node)) {
            checkBoxStyle(node.style, true);
            node.children.forEach(visit);
        }
    };
    visit(body.layout);

    // After the layout, so a slot the layout never places cannot vouch for the image it names.
    for (const slot of body.slots.filter(isPublisherTextSlotV1)) {
        checkBoxStyle(slot.style, referencedIds.has(slot.localIdentifier));
    }

    for (const slotId of slotIds) {
        if (!referencedIds.has(slotId) && !backgroundIds.has(slotId)) {
            issues.push({
                severity: "warning",
                message: `Slot "${slotId}" is not placed by the layout and never renders.`,
            });
        }
    }

    return issues;
}
