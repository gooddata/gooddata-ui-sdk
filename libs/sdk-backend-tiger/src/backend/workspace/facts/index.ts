// (C) 2019-2026 GoodData Corporation

import { invariant } from "ts-invariant";

import {
    type ITigerClientBase,
    type JsonApiDatasetOutWithLinks,
    jsonApiHeaders,
} from "@gooddata/api-client-tiger";
import { EntitiesApi_GetEntityFacts } from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import { type IFactsQuery, type IWorkspaceFactsService } from "@gooddata/sdk-backend-spi";
import {
    type IDataSetMetadataObject,
    type IFactMetadataObject,
    type IMetadataObject,
    type IMetadataObjectBase,
    type IMetadataObjectIdentity,
    type ObjRef,
    isIdentifierRef,
} from "@gooddata/sdk-model";

import { FactsQuery } from "./factsQuery.js";
import { convertDatasetWithLinks, convertFact } from "../../../convertors/fromBackend/MetadataConverter.js";
import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { objRefToIdentifier } from "../../../utils/api.js";
import { ldmItemUpdate } from "../../../utils/ldmItemUpdate.js";

export class TigerWorkspaceFacts implements IWorkspaceFactsService {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        public readonly workspace: string,
    ) {}

    public async getFactDatasetMeta(ref: ObjRef): Promise<IMetadataObject> {
        return this.authCall((client) => {
            return loadFactDataset(client, this.workspace, ref);
        });
    }

    public getFactsQuery(): IFactsQuery {
        return new FactsQuery(this.authCall, {
            workspaceId: this.workspace,
        });
    }

    public async getFact(ref: ObjRef, opts: { include?: ["dataset"] } = {}): Promise<IFactMetadataObject> {
        const id = objRefToIdentifier(ref, this.authCall);
        const result = await this.authCall((client) =>
            EntitiesApi_GetEntityFacts(
                client.axios,
                client.basePath,
                {
                    objectId: id,
                    workspaceId: this.workspace,
                    include: [...(opts.include ?? [])],
                },
                {
                    headers: jsonApiHeaders,
                },
            ),
        );

        return convertFact(result.data);
    }

    public updateFactMeta = async (
        updatedFact: Partial<IMetadataObjectBase> & IMetadataObjectIdentity,
    ): Promise<IFactMetadataObject> => {
        invariant(isIdentifierRef(updatedFact.ref), "tiger backend only supports referencing by identifier");

        return this.authCall(async (client) => {
            await ldmItemUpdate(client, this.workspace, updatedFact);
            return this.getFact(updatedFact.ref);
        });
    };
}

function loadFactDataset(
    client: ITigerClientBase,
    workspace: string,
    ref: ObjRef,
): Promise<IDataSetMetadataObject> {
    invariant(isIdentifierRef(ref), "tiger backend only supports referencing by identifier");

    return EntitiesApi_GetEntityFacts(
        client.axios,
        client.basePath,
        {
            workspaceId: workspace,
            objectId: ref.identifier,
            include: ["datasets"],
        },
        {
            headers: jsonApiHeaders,
        },
    ).then((res) => {
        // if this happens then its either bad query parameterization or the backend is hosed badly
        invariant(
            res.data.included && res.data.included.length > 0,
            "server returned that fact does not belong to any dataset",
        );
        const datasets = res.data.included.filter((include): include is JsonApiDatasetOutWithLinks => {
            return include.type === "dataset";
        });

        return convertDatasetWithLinks(datasets[0]);
    });
}
