// (C) 2019-2020 GoodData Corporation
import { IWorkspaceFactsService } from "@gooddata/sdk-backend-spi";
import { ObjRef, idRef, IMetadataObject, newDataSetMetadataObject } from "@gooddata/sdk-model";

export class TigerWorkspaceFacts implements IWorkspaceFactsService {
    constructor() {}

    public async getFactDatasetMeta(_ref: ObjRef): Promise<IMetadataObject> {
        return newDataSetMetadataObject(idRef("dummyDataset"), (m) =>
            m.id("dummyDataset").uri("/dummy/dataset").title("Dummy dataset").description(""),
        );
    }
}
