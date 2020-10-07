// (C) 2019-2020 GoodData Corporation
import { ObjRef, IMetadataObject } from "@gooddata/sdk-model";

/**
 * Service for querying additional facts data.
 * If you want to query facts themselves, use catalog {@link IWorkspaceCatalogFactory}
 *
 * @public
 */
export interface IWorkspaceFactsService {
    /**
     * Get information about the given fact's dataset
     * @param ref - ref of the fact
     * @returns promise of metadata object
     */
    getFactDatasetMeta(ref: ObjRef): Promise<IMetadataObject>;
}
