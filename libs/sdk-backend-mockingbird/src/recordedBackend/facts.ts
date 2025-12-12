// (C) 2019-2025 GoodData Corporation

import { type IFactsQuery, type IWorkspaceFactsService, NotSupported } from "@gooddata/sdk-backend-spi";
import {
    type IFactMetadataObject,
    type IMetadataObject,
    type IMetadataObjectBase,
    type IMetadataObjectIdentity,
    type ObjRef,
} from "@gooddata/sdk-model";

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

    public getFact(_: ObjRef): Promise<IFactMetadataObject> {
        throw new NotSupported("not supported");
    }

    public updateFactMeta(
        _: Partial<IMetadataObjectBase> & IMetadataObjectIdentity,
    ): Promise<IFactMetadataObject> {
        throw new NotSupported("not supported");
    }
}
