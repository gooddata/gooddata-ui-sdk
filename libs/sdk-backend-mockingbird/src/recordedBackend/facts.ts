// (C) 2019-2020 GoodData Corporation

import { IWorkspaceFactsService, NotSupported } from "@gooddata/sdk-backend-spi";
import { ObjRef, IMetadataObject } from "@gooddata/sdk-model";

/**
 * @internal
 */
export class RecordedFacts implements IWorkspaceFactsService {
    constructor() {}

    public getFactDatasetMeta(_: ObjRef): Promise<IMetadataObject> {
        throw new NotSupported("not supported");
    }
}
