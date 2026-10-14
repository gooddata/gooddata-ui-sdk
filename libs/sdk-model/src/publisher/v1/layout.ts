// (C) 2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import { type IPublisherBoxStyleV1 } from "./styling.js";

/**
 * Node of a page layout: a recursive row/column split tree (flexbox semantics)
 * over a fixed page. Leaves assign their area to slots; the tree carries geometry and
 * box paint, slot content lives in {@link IPublisherPageBodyV1.slots}.
 *
 * @alpha
 */
export type PublisherPageLayoutNodeV1 = IPublisherLayoutSectionV1 | IPublisherLayoutSlotRefV1;

/**
 * Fields common to all page layout nodes.
 *
 * @alpha
 */
export interface IPublisherLayoutNodeBaseV1 {
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
export interface IPublisherLayoutSectionV1 extends IPublisherLayoutNodeBaseV1 {
    type: "section";

    /**
     * "row" lays children out horizontally, "column" vertically.
     */
    direction: "row" | "column";

    children: PublisherPageLayoutNodeV1[];

    /**
     * Paint of this section's box. Never affects how children are laid out.
     */
    style?: IPublisherBoxStyleV1;
}

/**
 * A leaf assigning its area to a slot. The slot fills the area completely.
 *
 * @alpha
 */
export interface IPublisherLayoutSlotRefV1 extends IPublisherLayoutNodeBaseV1 {
    type: "slotRef";

    /**
     * Local identifier of a slot in {@link IPublisherPageBodyV1.slots}.
     * A slotId with no matching slot renders as an empty area.
     */
    slotId: string;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IPublisherLayoutSectionV1}.
 *
 * @alpha
 */
export function isPublisherLayoutSectionV1(obj: unknown): obj is IPublisherLayoutSectionV1 {
    return !isEmpty(obj) && (obj as IPublisherLayoutSectionV1).type === "section";
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IPublisherLayoutSlotRefV1}.
 *
 * @alpha
 */
export function isPublisherLayoutSlotRefV1(obj: unknown): obj is IPublisherLayoutSlotRefV1 {
    return !isEmpty(obj) && (obj as IPublisherLayoutSlotRefV1).type === "slotRef";
}
