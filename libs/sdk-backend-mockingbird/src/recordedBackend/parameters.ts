// (C) 2026 GoodData Corporation

import {
    type IParametersQuery,
    type IWorkspaceParametersService,
    NotSupported,
} from "@gooddata/sdk-backend-spi";
import type {
    IMetadataObjectBase,
    IMetadataObjectIdentity,
    IParameterMetadataObject,
    IParameterMetadataObjectDefinition,
    ObjRef,
} from "@gooddata/sdk-model";

export class RecordedParameters implements IWorkspaceParametersService {
    public async createParameter(
        _parameter: IParameterMetadataObjectDefinition,
    ): Promise<IParameterMetadataObject> {
        throw new NotSupported("not supported");
    }

    public getParametersQuery(): IParametersQuery {
        throw new NotSupported("not supported");
    }

    public async getParameter(_ref: ObjRef): Promise<IParameterMetadataObject> {
        throw new NotSupported("not supported");
    }

    public async updateParameterMeta(
        _updatedParameter: Partial<IMetadataObjectBase> & IMetadataObjectIdentity,
    ): Promise<IParameterMetadataObject> {
        throw new NotSupported("not supported");
    }
}
