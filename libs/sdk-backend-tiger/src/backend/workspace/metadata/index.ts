// (C) 2019-2020 GoodData Corporation
import { IWorkspaceMetadata } from "@gooddata/sdk-backend-spi";
import {
    IAttributeDisplayFormMetadataObject,
    IMeasureExpressionToken,
    ObjRef,
    newAttributeDisplayFormMetadataObject,
    idRef,
    IMetadataObject,
    newDataSetMetadataObject,
} from "@gooddata/sdk-model";
import { TigerAuthenticatedCallGuard } from "../../../types";

export class TigerWorkspaceMetadata implements IWorkspaceMetadata {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {}

    public getAttributeDisplayForm = async (ref: ObjRef): Promise<IAttributeDisplayFormMetadataObject> => {
        return this.authCall(async () =>
            newAttributeDisplayFormMetadataObject(ref, df =>
                df.title("Display form").attribute(idRef("attr.dummy")),
            ),
        );
    };

    public async getMeasureExpressionTokens(_ref: ObjRef): Promise<IMeasureExpressionToken[]> {
        return [];
    }

    public async getFactDatasetMeta(_ref: ObjRef): Promise<IMetadataObject> {
        return newDataSetMetadataObject(idRef("dummyDataset"), m =>
            m
                .id("dummyDataset")
                .uri("/dummy/dataset")
                .title("Dummy dataset")
                .description(""),
        );
    }
}
