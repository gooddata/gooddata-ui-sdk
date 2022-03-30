// (C) 2019-2022 GoodData Corporation

import {
    IWorkspaceFactsService,
    IMetadataObject,
    NotSupported,
    ICatalogFact,
} from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";

/**
 * @internal
 */
export class RecordedFacts implements IWorkspaceFactsService {
    public getFactDatasetMeta(_: ObjRef): Promise<IMetadataObject> {
        throw new NotSupported("not supported");
    }

    public getFacts(_factRefs: ObjRef[]): Promise<ICatalogFact[]> {
        throw new NotSupported("not supported");
    }
}
