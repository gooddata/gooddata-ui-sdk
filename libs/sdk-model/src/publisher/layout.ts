// (C) 2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import { type IPublisherBoxStyle } from "./styling.js";

/**
 * Node of a page layout: a recursive row/column split tree (flexbox semantics)
 * over a fixed page. Leaves assign their area to slots; the tree carries geometry and
 * box paint, slot content lives in {@link IPublisherPageBody.slots}.
 *
 * @alpha
 */
export type PublisherPageLayoutNode = IPublisherLayoutSection | IPublisherLayoutSlotRef;

/**
 * Fields common to all page layout nodes.
 *
 * @alpha
 */
export interface IPublisherLayoutNodeBase {
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
export interface IPublisherLayoutSection extends IPublisherLayoutNodeBase {
    type: "section";

    /**
     * "row" lays children out horizontally, "column" vertically.
     */
    direction: "row" | "column";

    children: PublisherPageLayoutNode[];

    /**
     * Paint of this section's box. Never affects how children are laid out.
     */
    style?: IPublisherBoxStyle;
}

/**
 * A leaf assigning its area to a slot. The slot fills the area completely.
 *
 * @alpha
 */
export interface IPublisherLayoutSlotRef extends IPublisherLayoutNodeBase {
    type: "slotRef";

    /**
     * Local identifier of a slot in {@link IPublisherPageBody.slots}.
     * A slotId with no matching slot renders as an empty area.
     */
    slotId: string;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IPublisherLayoutSection}.
 *
 * @alpha
 */
export function isPublisherLayoutSection(obj: unknown): obj is IPublisherLayoutSection {
    return !isEmpty(obj) && (obj as IPublisherLayoutSection).type === "section";
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IPublisherLayoutSlotRef}.
 *
 * @alpha
 */
export function isPublisherLayoutSlotRef(obj: unknown): obj is IPublisherLayoutSlotRef {
    return !isEmpty(obj) && (obj as IPublisherLayoutSlotRef).type === "slotRef";
}
