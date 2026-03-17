// (C) 2026 GoodData Corporation

/**
 * Represents a custom geo collection stored at the organization level.
 *
 * @alpha
 */
export interface IGeoCollection {
    /**
     * Identifier of the geo collection.
     */
    id: string;

    /**
     * Human-readable name.
     */
    name?: string;

    /**
     * Optional description.
     */
    description?: string;
}

/**
 * Definition for creating a new geo collection (without id).
 *
 * @alpha
 */
export interface IGeoCollectionDefinition {
    /**
     * Human-readable name.
     */
    name: string;

    /**
     * Optional description.
     */
    description?: string;
}

/**
 * Result of staging a file upload for geo collection import.
 *
 * @alpha
 */
export interface IGeoCollectionFileUploadResult {
    /**
     * Location reference to the staged file.
     */
    location: string;
}
