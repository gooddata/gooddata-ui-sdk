// (C) 2019-2022 GoodData Corporation
import { IWorkspaceFactsService } from "@gooddata/sdk-backend-spi";
import { IDataSetMetadataObject, IMetadataObject, isIdentifierRef, ObjRef } from "@gooddata/sdk-model";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { ITigerClient, jsonApiHeaders } from "@gooddata/api-client-tiger";
import { invariant } from "ts-invariant";
import { convertDatasetWithLinks } from "../../../convertors/fromBackend/MetadataConverter.js";

export class TigerWorkspaceFacts implements IWorkspaceFactsService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {}

    public async getFactDatasetMeta(ref: ObjRef): Promise<IMetadataObject> {
        return this.authCall((client) => {
            return loadFactDataset(client, this.workspace, ref);
        });
    }
}

function loadFactDataset(
    client: ITigerClient,
    workspace: string,
    ref: ObjRef,
): Promise<IDataSetMetadataObject> {
    invariant(isIdentifierRef(ref), "tiger backend only supports referencing by identifier");

    return client.entities
        .getEntityFacts(
            {
                workspaceId: workspace,
                objectId: ref.identifier,
                include: ["datasets"],
            },
            {
                headers: jsonApiHeaders,
            },
        )
        .then((res) => {
            // if this happens then its either bad query parameterization or the backend is hosed badly
            invariant(
                res.data.included && res.data.included.length > 0,
                "server returned that fact does not belong to any dataset",
            );

            return convertDatasetWithLinks(res.data.included[0]);
        });
}
