// (C) 2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import { type IAuditableDates, type IAuditableUsers } from "../base/metadata.js";
import { type FilterContextItem } from "../dashboard/filterContext.js";
import { type ObjRef, isObjRef } from "../objRef/index.js";

import { type ReportPageLayoutNode, isReportLayoutSection, isReportLayoutSlotRef } from "./layout.js";
import { type ReportPageFormat, isReportPageFormat } from "./pageFormat.js";
import { type ReportSlot, isReportImageSlot, isReportTextSlot } from "./slot.js";
import { type IReportBoxStyle, isReportImageBackground } from "./styling.js";

/**
 * Body of a report page: geometry (flex split tree) plus the slots it places.
 *
 * @remarks
 * This is both the content of the standalone {@link IReportPageLayout} object and the shape
 * embedded in template/report content ({@link IReportContentPage}).
 *
 * There is no header/footer chrome: page title, description, footer, page numbers and
 * logos are ordinary slots in the layout tree (text slots with `{{pageNumber}}`/`{{totalPages}}`,
 * an image slot with `{{logo}}`). Every slot fills its layout area completely.
 *
 * @alpha
 */
export interface IReportPageBody {
    /**
     * Editor hint only (template galleries, default styling, AI context).
     * Renderers must not branch layout logic on it — geometry always comes from `layout`.
     */
    kind?: "cover" | "section" | "content";

    /**
     * Page proportions the layout was authored for. Defaults to
     * {@link DefaultReportPageFormat}.
     */
    format?: ReportPageFormat;

    /**
     * Paint of the page itself, behind everything the layout places.
     */
    style?: IReportBoxStyle;

    /**
     * Root of the page layout tree.
     */
    layout: ReportPageLayoutNode;

    /**
     * All slots referenced by the layout, flat, keyed by localIdentifier.
     */
    slots: ReportSlot[];

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
export interface IReportPageLayoutContent extends IReportPageBody {
    /**
     * Content model version, for stored-content evolution.
     */
    version: "1";
}

/**
 * Payload for creating or updating a report page.
 *
 * @alpha
 */
export interface IReportPageLayoutDefinition {
    type: "reportPageLayout";

    /**
     * Present when updating an existing page.
     */
    ref?: ObjRef;

    title: string;

    description?: string;

    tags?: string[];

    content: IReportPageLayoutContent;
}

/**
 * Reusable report page metadata object.
 *
 * @alpha
 */
export interface IReportPageLayout extends IReportPageLayoutDefinition, IAuditableDates, IAuditableUsers {
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
 * Type-guard testing whether the provided object is an instance of {@link IReportPageLayoutDefinition}.
 *
 * @alpha
 */
export function isReportPageLayoutDefinition(obj: unknown): obj is IReportPageLayoutDefinition {
    return !isEmpty(obj) && (obj as IReportPageLayoutDefinition).type === "reportPageLayout";
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IReportPageLayout}.
 *
 * @alpha
 */
export function isReportPageLayout(obj: unknown): obj is IReportPageLayout {
    return isReportPageLayoutDefinition(obj) && isObjRef((obj as IReportPageLayout).ref);
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IReportPageLayoutContent}.
 *
 * @alpha
 */
export function isReportPageLayoutContentV1(obj: unknown): obj is IReportPageLayoutContent {
    return (
        !isEmpty(obj) &&
        (obj as IReportPageLayoutContent).version === "1" &&
        !isEmpty((obj as IReportPageLayoutContent).layout) &&
        Array.isArray((obj as IReportPageLayoutContent).slots)
    );
}

/**
 * Validation issue found in a report page body.
 *
 * @alpha
 */
export interface IReportPageBodyValidationIssue {
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
export function validateReportPageBody(body: IReportPageBody): IReportPageBodyValidationIssue[] {
    const issues: IReportPageBodyValidationIssue[] = [];

    if (body.format !== undefined && !isReportPageFormat(body.format)) {
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
    const checkBoxStyle = (style: IReportBoxStyle | undefined, isDrawn: boolean): void => {
        checkLength("Border radius", style?.borderRadius);
        checkLength("Padding", style?.padding);
        if (!style?.background || !isReportImageBackground(style.background)) {
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
        if (!isReportImageSlot(slot)) {
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
    const visit = (node: ReportPageLayoutNode): void => {
        if (node.weight !== undefined && !(node.weight > 0)) {
            issues.push({
                severity: "error",
                message: `Layout node weight must be positive, got ${node.weight}.`,
            });
        }
        if (isReportLayoutSlotRef(node)) {
            referencedIds.add(node.slotId);
            if (!slotIds.has(node.slotId)) {
                issues.push({
                    severity: "warning",
                    message: `Layout references slot "${node.slotId}" which has no definition; it renders empty.`,
                });
            }
        } else if (isReportLayoutSection(node)) {
            checkBoxStyle(node.style, true);
            node.children.forEach(visit);
        }
    };
    visit(body.layout);

    // After the layout, so a slot the layout never places cannot vouch for the image it names.
    for (const slot of body.slots.filter(isReportTextSlot)) {
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
