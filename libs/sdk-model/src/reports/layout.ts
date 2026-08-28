// (C) 2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import { type IReportBoxStyle } from "./styling.js";

/**
 * Node of a report page layout: a recursive row/column split tree (flexbox semantics)
 * over a fixed page. Leaves assign their area to slots; the tree carries geometry and
 * box paint, slot content lives in {@link IReportPageBody.slots}.
 *
 * @alpha
 */
export type ReportPageLayoutNode = IReportLayoutSection | IReportLayoutSlotRef;

/**
 * Fields common to all report layout nodes.
 *
 * @alpha
 */
export interface IReportLayoutNodeBase {
    /**
     * Fractional weight of this node inside its parent (flex-grow semantics).
     * Defaults to 1. Example: sibling weights [2, 1] render a 2/3 + 1/3 split.
     */
    weight?: number;
}

/**
 * A container splitting its area into children laid out along a direction.
 *
 * @alpha
 */
export interface IReportLayoutSection extends IReportLayoutNodeBase {
    type: "section";

    /**
     * "row" lays children out horizontally, "column" vertically.
     */
    direction: "row" | "column";

    children: ReportPageLayoutNode[];

    /**
     * Paint of this section's box. Never affects how children are laid out.
     */
    style?: IReportBoxStyle;
}

/**
 * A leaf assigning its area to a slot. The slot fills the area completely.
 *
 * @alpha
 */
export interface IReportLayoutSlotRef extends IReportLayoutNodeBase {
    type: "slotRef";

    /**
     * Local identifier of a slot in {@link IReportPageBody.slots}.
     * A slotId with no matching slot renders as an empty area.
     */
    slotId: string;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IReportLayoutSection}.
 *
 * @alpha
 */
export function isReportLayoutSection(obj: unknown): obj is IReportLayoutSection {
    return !isEmpty(obj) && (obj as IReportLayoutSection).type === "section";
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IReportLayoutSlotRef}.
 *
 * @alpha
 */
export function isReportLayoutSlotRef(obj: unknown): obj is IReportLayoutSlotRef {
    return !isEmpty(obj) && (obj as IReportLayoutSlotRef).type === "slotRef";
}
