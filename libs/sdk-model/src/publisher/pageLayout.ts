// (C) 2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import { type IAuditableDates, type IAuditableUsers } from "../base/metadata.js";
import { type FilterContextItem } from "../dashboard/filterContext.js";
import { type ObjRef, isObjRef } from "../objRef/index.js";

import {
    type PublisherPageLayoutNode,
    isPublisherLayoutSection,
    isPublisherLayoutSlotRef,
} from "./layout.js";
import { type PublisherPageFormat, isPublisherPageFormat } from "./pageFormat.js";
import { type PublisherSlot, isPublisherImageSlot, isPublisherTextSlot } from "./slot.js";
import { type IPublisherBoxStyle, isPublisherImageBackground } from "./styling.js";

/**
 * Body of a document page: geometry (flex split tree) plus the slots it places.
 *
 * @remarks
 * This is both the content of the standalone {@link IPublisherPageLayout} object and the shape
 * embedded in template/document content ({@link IPublisherDocumentPage}).
 *
 * There is no header/footer chrome: page title, description, footer, page numbers and
 * logos are ordinary slots in the layout tree (text slots with `{currentPageNumber}`/`{totalPages}`,
 * an image slot with `{logo}`). Every slot fills its layout area completely.
 *
 * @alpha
 */
export interface IPublisherPageBody {
    /**
     * Editor hint only (template galleries, default styling, AI context).
     * Renderers must not branch layout logic on it — geometry always comes from `layout`.
     */
    kind?: "cover" | "section" | "content";

    /**
     * Page proportions the layout was authored for. Defaults to
     * {@link DefaultPublisherPageFormat}.
     */
    format?: PublisherPageFormat;

    /**
     * Paint of the page itself, behind everything the layout places.
     */
    style?: IPublisherBoxStyle;

    /**
     * Root of the page layout tree.
     */
    layout: PublisherPageLayoutNode;

    /**
     * All slots referenced by the layout, flat, keyed by localIdentifier.
     */
    slots: PublisherSlot[];

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
export interface IPublisherPageLayoutContent extends IPublisherPageBody {
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
export interface IPublisherPageLayoutDefinition {
    type: "reportPageLayout";

    /**
     * Present when updating an existing page.
     */
    ref?: ObjRef;

    title: string;

    description?: string;

    tags?: string[];

    content: IPublisherPageLayoutContent;
}

/**
 * Reusable page layout metadata object.
 *
 * @alpha
 */
export interface IPublisherPageLayout
    extends IPublisherPageLayoutDefinition, IAuditableDates, IAuditableUsers {
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
 * Type-guard testing whether the provided object is an instance of {@link IPublisherPageLayoutDefinition}.
 *
 * @alpha
 */
export function isPublisherPageLayoutDefinition(obj: unknown): obj is IPublisherPageLayoutDefinition {
    return !isEmpty(obj) && (obj as IPublisherPageLayoutDefinition).type === "reportPageLayout";
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IPublisherPageLayout}.
 *
 * @alpha
 */
export function isPublisherPageLayout(obj: unknown): obj is IPublisherPageLayout {
    return isPublisherPageLayoutDefinition(obj) && isObjRef((obj as IPublisherPageLayout).ref);
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IPublisherPageLayoutContent}.
 *
 * @alpha
 */
export function isPublisherPageLayoutContentV1(obj: unknown): obj is IPublisherPageLayoutContent {
    return (
        !isEmpty(obj) &&
        (obj as IPublisherPageLayoutContent).version === "1" &&
        !isEmpty((obj as IPublisherPageLayoutContent).layout) &&
        Array.isArray((obj as IPublisherPageLayoutContent).slots)
    );
}

/**
 * Validation issue found in a page body.
 *
 * @alpha
 */
export interface IPublisherPageBodyValidationIssue {
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
export function validatePublisherPageBody(body: IPublisherPageBody): IPublisherPageBodyValidationIssue[] {
    const issues: IPublisherPageBodyValidationIssue[] = [];

    if (body.format !== undefined && !isPublisherPageFormat(body.format)) {
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
    const checkBoxStyle = (style: IPublisherBoxStyle | undefined, isDrawn: boolean): void => {
        checkLength("Border radius", style?.borderRadius);
        checkLength("Padding", style?.padding);
        if (!style?.background || !isPublisherImageBackground(style.background)) {
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
        if (!isPublisherImageSlot(slot)) {
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
    const visit = (node: PublisherPageLayoutNode): void => {
        if (node.weight !== undefined && !(node.weight > 0)) {
            issues.push({
                severity: "error",
                message: `Layout node weight must be positive, got ${node.weight}.`,
            });
        }
        if (isPublisherLayoutSlotRef(node)) {
            referencedIds.add(node.slotId);
            if (!slotIds.has(node.slotId)) {
                issues.push({
                    severity: "warning",
                    message: `Layout references slot "${node.slotId}" which has no definition; it renders empty.`,
                });
            }
        } else if (isPublisherLayoutSection(node)) {
            checkBoxStyle(node.style, true);
            node.children.forEach(visit);
        }
    };
    visit(body.layout);

    // After the layout, so a slot the layout never places cannot vouch for the image it names.
    for (const slot of body.slots.filter(isPublisherTextSlot)) {
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
