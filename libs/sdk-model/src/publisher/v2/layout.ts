// (C) 2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import { type IPublisherContainerStyleV2 } from "./style.js";
import { type PublisherWidgetV2 } from "./widget.js";

/**
 * @alpha
 */
export type PublisherLayoutNodeV2 = IPublisherContainerV2 | PublisherWidgetV2;

/**
 * Row or column of layout nodes.
 *
 * @alpha
 */
export interface IPublisherContainerV2 {
    type: "row" | "column";
    /**
     * Matches `[A-Za-z0-9_.-]{1,64}`.
     */
    id?: string;
    /**
     * In reading order. An empty list renders as a spacer.
     */
    children: PublisherLayoutNodeV2[];
    /**
     * Share of the parent's main axis, greater than 0. Defaults to 1.
     */
    proportion?: number;
    /**
     * Enforced by the editor, never checked on write.
     */
    locked?: boolean;
    style?: IPublisherContainerStyleV2;
}

/**
 * @alpha
 */
export function isPublisherContainerV2(obj: unknown): obj is IPublisherContainerV2 {
    return isPublisherRowV2(obj) || isPublisherColumnV2(obj);
}

/**
 * @alpha
 */
export function isPublisherRowV2(obj: unknown): obj is IPublisherContainerV2 & { type: "row" } {
    return !isEmpty(obj) && (obj as IPublisherContainerV2).type === "row";
}

/**
 * @alpha
 */
export function isPublisherColumnV2(obj: unknown): obj is IPublisherContainerV2 & { type: "column" } {
    return !isEmpty(obj) && (obj as IPublisherContainerV2).type === "column";
}
