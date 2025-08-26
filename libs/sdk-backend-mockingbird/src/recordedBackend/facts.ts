// (C) 2019-2025 GoodData Corporation

import { IFactsQuery, IWorkspaceFactsService, NotSupported } from "@gooddata/sdk-backend-spi";
import { IMetadataObject, ObjRef } from "@gooddata/sdk-model";

/**
 * @internal
 */
export class RecordedFacts implements IWorkspaceFactsService {
    public getFactDatasetMeta(_: ObjRef): Promise<IMetadataObject> {
        throw new NotSupported("not supported");
    }

    public getFactsQuery(): IFactsQuery {
        throw new NotSupported("not supported");
    }
}
