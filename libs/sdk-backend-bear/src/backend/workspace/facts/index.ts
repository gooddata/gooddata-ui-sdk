// (C) 2019-2022 GoodData Corporation
import invariant from "ts-invariant";
import { IWorkspaceFactsService, IMetadataObject, ICatalogFact } from "@gooddata/sdk-backend-spi";
import { GdcMetadata } from "@gooddata/api-model-bear";
import { ObjRef } from "@gooddata/sdk-model";
import { BearAuthenticatedCallGuard } from "../../../types/auth";
import { convertMetadataObjectXrefEntry } from "../../../convertors/fromBackend/MetaConverter";
import { getObjectIdFromUri, objRefsToUris, objRefToUri } from "../../../utils/api";
import { convertWrappedFact } from "../../../convertors/fromBackend/CatalogConverter";

export class BearWorkspaceFacts implements IWorkspaceFactsService {
    constructor(private readonly authCall: BearAuthenticatedCallGuard, public readonly workspace: string) {}

    public async getFactDatasetMeta(ref: ObjRef): Promise<IMetadataObject> {
        const uri = await objRefToUri(ref, this.workspace, this.authCall);
        const objectId = getObjectIdFromUri(uri);

        return this.authCall(async (sdk) => {
            const usedBy = await sdk.xhr.getParsed<{ entries: GdcMetadata.IObjectXrefEntry[] }>(
                `/gdc/md/${this.workspace}/usedby2/${objectId}?types=dataSet`,
            );

            invariant(usedBy.entries.length > 0, "Fact must have a dataset associated to it.");

            return convertMetadataObjectXrefEntry("dataSet", usedBy.entries[0]);
        });
    }

    public async getFacts(factRefs: ObjRef[]): Promise<ICatalogFact[]> {
        const factUris = await objRefsToUris(factRefs, this.workspace, this.authCall, false);
        const wrappedFacts = await this.authCall((client) => {
            return client.md.getObjects<GdcMetadata.IWrappedFact>(this.workspace, factUris);
        });

        return wrappedFacts.map(convertWrappedFact);
    }
}
