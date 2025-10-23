// (C) 2019-2025 GoodData Corporation

import { IUser } from "../../../user/index.js";
import { IMetadataObject, isMetadataObject } from "../types.js";

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
    title: string;
    description: string;
    tags?: string[];
    strategy: MemoryItemStrategy;
    instruction: string;
    isDisabled?: boolean;
    keywords?: string[];
}

/**
 * Memory item metadata object
 *
 * @public
 */
export interface IMemoryItemMetadataObject extends IMetadataObject, IMemoryItemDefinition {
    type: "memoryItem";
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
