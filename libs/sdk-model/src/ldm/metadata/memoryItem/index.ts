// (C) 2019-2026 GoodData Corporation

import { type IUser } from "../../../user/index.js";
import { type IMetadataObject, isMetadataObject } from "../types.js";

/**
 * Memory item strategy.
 * @public
 */
export type MemoryItemStrategy = "ALWAYS" | "AUTO";

/**
 * Memory item definition.
 * @public
 */
export interface IMemoryItemDefinition {
    /**
     * Title associated with the memory item
     */
    title: string;
    /**
     * Description associated with the memory item
     */
    description: string;
    /**
     * Tags associated with the memory item
     */
    tags?: string[];
    /**
     * Strategy associated with the memory item
     */
    strategy: MemoryItemStrategy;
    /**
     * Instructions associated with the memory item
     */
    instruction: string;
    /**
     * Whether the memory item is disabled
     */
    isDisabled: boolean;
    /**
     * Keywords associated with the memory item
     */
    keywords?: string[];
}

/**
 * Memory item metadata object
 *
 * @public
 */
export interface IMemoryItemMetadataObject extends IMetadataObject, IMemoryItemDefinition {
    type: "memoryItem";

    /**
     * Whether the memory is locked for editing
     */
    isLocked?: boolean;

    /**
     * The user who created the memory item
     */
    createdBy: IUser | undefined;
}

/**
 * Tests whether the provided object is of type {@link IMemoryItemMetadataObject}.
 *
 * @param obj - object to test
 * @public
 */
export function isMemoryItemMetadataObject(obj: unknown): obj is IMemoryItemMetadataObject {
    return isMetadataObject(obj) && obj.type === "memoryItem";
}
