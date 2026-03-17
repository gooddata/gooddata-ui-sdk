// (C) 2026 GoodData Corporation

import {
    type IGeoCollection,
    type IGeoCollectionDefinition,
    type IGeoCollectionFileUploadResult,
} from "@gooddata/sdk-model";

/**
 * Service for managing organization-level custom geo collections.
 *
 * @remarks
 * Importing geo data into a collection follows a three-step workflow:
 * 1. Upload a file via {@link IOrganizationGeoCollectionsService.uploadGeoCollectionFile}
 * 2. Convert it via {@link IOrganizationGeoCollectionsService.convertGeoCollectionFile}
 * 3. Import it via {@link IOrganizationGeoCollectionsService.importGeoCollectionFile}
 *
 * @alpha
 */
export interface IOrganizationGeoCollectionsService {
    /**
     * Get all custom geo collections.
     *
     * @returns Promise resolved with array of geo collections.
     */
    getAll(): Promise<IGeoCollection[]>;

    /**
     * Get a single custom geo collection by its identifier.
     *
     * @param id - identifier of the geo collection
     * @returns Promise resolved with the geo collection, or undefined if not found.
     */
    getGeoCollection(id: string): Promise<IGeoCollection | undefined>;

    /**
     * Create a new custom geo collection.
     *
     * @param definition - definition of the geo collection to create
     * @returns Promise resolved with created geo collection including its generated id.
     */
    createGeoCollection(definition: IGeoCollectionDefinition): Promise<IGeoCollection>;

    /**
     * Update an existing custom geo collection.
     *
     * @param geoCollection - geo collection with updated properties
     * @returns Promise resolved with updated geo collection.
     */
    updateGeoCollection(geoCollection: IGeoCollection): Promise<IGeoCollection>;

    /**
     * Delete a custom geo collection.
     *
     * @param id - identifier of the geo collection to delete
     */
    deleteGeoCollection(id: string): Promise<void>;

    /**
     * Upload a file to staging for subsequent import into a geo collection.
     *
     * @param file - geo data file to upload
     * @returns Promise resolved with the staging location reference.
     */
    uploadGeoCollectionFile(file: File): Promise<IGeoCollectionFileUploadResult>;

    /**
     * Convert a staged geo file into an importable format.
     *
     * @param location - staging location from a previous upload
     * @returns Promise resolved with the converted file location reference.
     */
    convertGeoCollectionFile(location: string): Promise<IGeoCollectionFileUploadResult>;

    /**
     * Import a staged and converted file into a geo collection.
     *
     * @param collectionId - identifier of the target geo collection
     * @param location - location of the converted file to import
     */
    importGeoCollectionFile(collectionId: string, location: string): Promise<void>;
}
