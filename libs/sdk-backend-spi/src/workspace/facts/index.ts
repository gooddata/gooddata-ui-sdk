// (C) 2019-2022 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";
import { ICatalogFact } from "../fromModel/ldm/catalog";
import { IMetadataObject } from "../fromModel/ldm/metadata";

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

    /**
     * Get all metadata objects for given fact references.
     *
     * @remarks
     * If the array of the given references is too large, the function must load all the facts
     * available for the current workspace as there is only limited length of the query parameter.
     *
     * Consider if you need to fetch all required facts at once or if you could fetch them
     * separately for better performance results.
     *
     * @param factRefs - references of the facts to get.
     * @returns promise of {@link IFactMetadataObject} array.
     */
    getCatalogFacts(factRefs: ObjRef[]): Promise<ICatalogFact[]>;
}
