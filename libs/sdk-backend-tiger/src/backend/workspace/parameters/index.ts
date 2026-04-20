// (C) 2026 GoodData Corporation

import { invariant } from "ts-invariant";

import {
    EntitiesApi_CreateEntityParameters,
    EntitiesApi_DeleteEntityParameters,
    EntitiesApi_GetEntityParameters,
    EntitiesApi_PatchEntityParameters,
} from "@gooddata/api-client-tiger";
import type { IParametersQuery, IWorkspaceParametersService } from "@gooddata/sdk-backend-spi";
import {
    type IMetadataObjectIdentity,
    type IParameterMetadataObject,
    type IParameterMetadataObjectDefinition,
    type ObjRef,
    isIdentifierRef,
} from "@gooddata/sdk-model";

import { convertParameter } from "../../../convertors/fromBackend/ParameterConverter.js";
import {
    convertParameterToBackendCreate,
    convertParameterToBackendUpdate,
} from "../../../convertors/toBackend/ParameterConverter.js";
import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { objRefToIdentifier } from "../../../utils/api.js";
import { ParametersQuery } from "./parametersQuery.js";

export class TigerWorkspaceParameters implements IWorkspaceParametersService {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        public readonly workspace: string,
    ) {}

    public getParametersQuery(): IParametersQuery {
        return new ParametersQuery(this.authCall, {
            workspaceId: this.workspace,
        });
    }

    public async createParameter(
        parameter: IParameterMetadataObjectDefinition,
    ): Promise<IParameterMetadataObject> {
        const result = await this.authCall((client) =>
            EntitiesApi_CreateEntityParameters(client.axios, client.basePath, {
                workspaceId: this.workspace,
                jsonApiParameterPostOptionalIdDocument: {
                    data: {
                        ...(parameter.id === undefined ? {} : { id: parameter.id }),
                        type: "parameter",
                        attributes: convertParameterToBackendCreate(parameter),
                    },
                },
                include: ["createdBy", "modifiedBy"],
            }),
        );

        return convertParameter(result.data.data, result.data.included);
    }

    public async getParameter(ref: ObjRef): Promise<IParameterMetadataObject> {
        const objectId = objRefToIdentifier(ref, this.authCall);
        const result = await this.authCall((client) =>
            EntitiesApi_GetEntityParameters(client.axios, client.basePath, {
                workspaceId: this.workspace,
                objectId,
                include: ["createdBy", "modifiedBy"],
                metaInclude: ["origin"],
            }),
        );

        return convertParameter(result.data.data, result.data.included);
    }

    public async updateParameter(
        updatedParameter: Partial<IParameterMetadataObjectDefinition> & IMetadataObjectIdentity,
    ): Promise<IParameterMetadataObject> {
        const ref = updatedParameter.ref;
        invariant(isIdentifierRef(ref), "tiger backend only supports referencing by identifier");

        const result = await this.authCall((client) =>
            EntitiesApi_PatchEntityParameters(client.axios, client.basePath, {
                objectId: ref.identifier,
                workspaceId: this.workspace,
                jsonApiParameterPatchDocument: {
                    data: {
                        id: ref.identifier,
                        type: "parameter",
                        attributes: convertParameterToBackendUpdate(updatedParameter),
                    },
                },
                include: ["createdBy", "modifiedBy"],
            }),
        );

        return convertParameter(result.data.data, result.data.included);
    }

    public async deleteParameter(ref: ObjRef): Promise<void> {
        const objectId = objRefToIdentifier(ref, this.authCall);
        await this.authCall((client) =>
            EntitiesApi_DeleteEntityParameters(client.axios, client.basePath, {
                objectId,
                workspaceId: this.workspace,
            }),
        );
    }
}
