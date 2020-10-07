// (C) 2019-2020 GoodData Corporation
import { IWorkspaceFactsService, IMetadataObject } from "@gooddata/sdk-backend-spi";
import { ObjRef, idRef } from "@gooddata/sdk-model";
import { newDataSetMetadataObject } from "@gooddata/sdk-backend-base";

export class TigerWorkspaceFacts implements IWorkspaceFactsService {
    constructor() {}

    public async getFactDatasetMeta(_ref: ObjRef): Promise<IMetadataObject> {
        return newDataSetMetadataObject(idRef("dummyDataset"), (m) =>
            m.id("dummyDataset").uri("/dummy/dataset").title("Dummy dataset").description(""),
        );
    }
}
