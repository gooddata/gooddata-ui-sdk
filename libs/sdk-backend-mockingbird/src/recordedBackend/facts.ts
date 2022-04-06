// (C) 2019-2022 GoodData Corporation

import { IWorkspaceFactsService, NotSupported } from "@gooddata/sdk-backend-spi";
import { ObjRef, ICatalogFact, IMetadataObject } from "@gooddata/sdk-model";

/**
 * @internal
 */
export class RecordedFacts implements IWorkspaceFactsService {
    public getFactDatasetMeta(_: ObjRef): Promise<IMetadataObject> {
        throw new NotSupported("not supported");
    }

    public getCatalogFacts(_factRefs: ObjRef[]): Promise<ICatalogFact[]> {
        throw new NotSupported("not supported");
    }
}
