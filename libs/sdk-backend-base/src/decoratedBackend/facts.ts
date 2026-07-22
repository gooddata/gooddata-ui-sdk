// (C) 2025-2026 GoodData Corporation

import { type IFactsQuery, type IWorkspaceFactsService } from "@gooddata/sdk-backend-spi";
import {
    type IFactMetadataObject,
    type IMetadataObject,
    type IMetadataObjectBase,
    type IMetadataObjectIdentity,
    type ObjRef,
} from "@gooddata/sdk-model";

/**
 * @alpha
 */
export abstract class DecoratedWorkspaceFactsService implements IWorkspaceFactsService {
    protected constructor(protected readonly decorated: IWorkspaceFactsService) {}

    public getFactDatasetMeta(ref: ObjRef): Promise<IMetadataObject> {
        return this.decorated.getFactDatasetMeta(ref);
    }

    public getFactsQuery(): IFactsQuery {
        return this.decorated.getFactsQuery();
    }

    public getFact(ref: ObjRef, opts?: { include?: ["dataset"] }): Promise<IFactMetadataObject> {
        return this.decorated.getFact(ref, opts);
    }

    public updateFactMeta(
        updatedFact: Partial<IMetadataObjectBase> & IMetadataObjectIdentity,
    ): Promise<IFactMetadataObject> {
        return this.decorated.updateFactMeta(updatedFact);
    }
}
