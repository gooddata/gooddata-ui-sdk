// (C) 2019-2022 GoodData Corporation
import { invariant } from "ts-invariant";
import { IWorkspaceFactsService } from "@gooddata/sdk-backend-spi";
import { GdcMetadata } from "@gooddata/api-model-bear";
import { ObjRef, IMetadataObject } from "@gooddata/sdk-model";
import { BearAuthenticatedCallGuard } from "../../../types/auth.js";
import { convertMetadataObjectXrefEntry } from "../../../convertors/fromBackend/MetaConverter.js";
import { getObjectIdFromUri, objRefToUri } from "../../../utils/api.js";

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
}
