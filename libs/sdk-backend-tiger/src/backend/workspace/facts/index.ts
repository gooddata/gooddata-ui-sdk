// (C) 2019-2022 GoodData Corporation
import {
    ICatalogFact,
    IDataSetMetadataObject,
    IMetadataObject,
    IWorkspaceFactsService,
} from "@gooddata/sdk-backend-spi";
import { isIdentifierRef, ObjRef } from "@gooddata/sdk-model";
import { TigerAuthenticatedCallGuard } from "../../../types";
import { ITigerClient, jsonApiHeaders, MetadataUtilities } from "@gooddata/api-client-tiger";
import { invariant } from "ts-invariant";
import { convertDatasetWithLinks } from "../../../convertors/fromBackend/MetadataConverter";
import { convertFact } from "../../../convertors/fromBackend/CatalogConverter";
import { objRefToIdentifier } from "../../../utils/api";

/**
 * Max filter length is calculated from the maximal length of the URL (2048 characters) and
 * its query parameters (1024 characters). As we can expect there are others query params,
 * filter parameter length specified as below.
 */
const MAX_FILTER_LENGTH = 800;

export class TigerWorkspaceFacts implements IWorkspaceFactsService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {}

    public async getFactDatasetMeta(ref: ObjRef): Promise<IMetadataObject> {
        return this.authCall((client) => {
            return loadFactDataset(client, this.workspace, ref);
        });
    }

    public async getCatalogFacts(factRefs: ObjRef[]): Promise<ICatalogFact[]> {
        const filter = factRefs
            .map(async (ref) => {
                const id = await objRefToIdentifier(ref, this.authCall);
                return `facts.id=${id}`;
            })
            .join(",");

        const facts = await this.authCall((client) => {
            return MetadataUtilities.getAllPagesOf(client, client.entities.getAllEntitiesFacts, {
                workspaceId: this.workspace,
                filter: filter.length < MAX_FILTER_LENGTH ? filter : undefined,
            }).then(MetadataUtilities.mergeEntitiesResults);
        });

        return facts.data.map(convertFact);
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
            },
            {
                headers: jsonApiHeaders,
                params: {
                    include: "datasets",
                },
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
