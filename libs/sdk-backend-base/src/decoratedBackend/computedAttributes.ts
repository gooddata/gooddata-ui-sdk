// (C) 2026 GoodData Corporation

import {
    type IComputedAttributeReferencing,
    type IComputedAttributesQuery,
    type IGetComputedAttributeOptions,
    type IMeasureExpressionToken,
    type IWorkspaceComputedAttributesService,
} from "@gooddata/sdk-backend-spi";
import {
    type IComputedAttributeMetadataObject,
    type IComputedAttributeMetadataObjectDefinition,
    type IMetadataObjectBase,
    type IMetadataObjectIdentity,
    type ObjRef,
} from "@gooddata/sdk-model";

/**
 * @alpha
 */
export abstract class DecoratedWorkspaceComputedAttributesService implements IWorkspaceComputedAttributesService {
    protected constructor(protected readonly decorated: IWorkspaceComputedAttributesService) {}

    public createComputedAttribute(
        computedAttribute: IComputedAttributeMetadataObjectDefinition,
    ): Promise<IComputedAttributeMetadataObject> {
        return this.decorated.createComputedAttribute(computedAttribute);
    }

    public updateComputedAttribute(
        computedAttribute: IComputedAttributeMetadataObject,
    ): Promise<IComputedAttributeMetadataObject> {
        return this.decorated.updateComputedAttribute(computedAttribute);
    }

    public updateComputedAttributeMeta(
        computedAttribute: Partial<IMetadataObjectBase> & IMetadataObjectIdentity,
    ): Promise<IComputedAttributeMetadataObject> {
        return this.decorated.updateComputedAttributeMeta(computedAttribute);
    }

    public deleteComputedAttribute(ref: ObjRef): Promise<void> {
        return this.decorated.deleteComputedAttribute(ref);
    }

    public getComputedAttribute(
        ref: ObjRef,
        options?: IGetComputedAttributeOptions,
    ): Promise<IComputedAttributeMetadataObject> {
        return this.decorated.getComputedAttribute(ref, options);
    }

    public getComputedAttributeExpressionTokens(ref: ObjRef): Promise<IMeasureExpressionToken[]> {
        return this.decorated.getComputedAttributeExpressionTokens(ref);
    }

    public getComputedAttributeReferencingObjects(ref: ObjRef): Promise<IComputedAttributeReferencing> {
        return this.decorated.getComputedAttributeReferencingObjects(ref);
    }

    public getComputedAttributesQuery(): IComputedAttributesQuery {
        return this.decorated.getComputedAttributesQuery();
    }
}
