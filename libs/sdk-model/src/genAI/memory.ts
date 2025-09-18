// (C) 2019-2025 GoodData Corporation

/**
 * GenAI Memory item types.
 * @internal
 */
export type GenAIMemoryItemType = "INSTRUCTION" | "SYNONYM" | "ABBREVIATION";

/**
 * GenAI Memory item.
 * @internal
 */
export interface IGenAIMemoryItem {
    id: string;
    type: GenAIMemoryItemType;
    instruction: string;
    keywords: string[];
}

/**
 * GenAI Memory item create/update payload.
 * @internal
 */
export type IGenAIMemoryItemCreate = Omit<IGenAIMemoryItem, "id">;
