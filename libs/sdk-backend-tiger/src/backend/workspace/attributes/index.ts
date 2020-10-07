// (C) 2019-2020 GoodData Corporation
import { IElementsQueryFactory, IWorkspaceAttributesService, NotSupported } from "@gooddata/sdk-backend-spi";
import {
    IAttributeDisplayFormMetadataObject,
    IAttributeMetadataObject,
    idRef,
    newAttributeDisplayFormMetadataObject,
    newAttributeMetadataObject,
    ObjRef,
} from "@gooddata/sdk-model";
import { TigerAuthenticatedCallGuard } from "../../../types";
import { TigerWorkspaceElements } from "./elements";

export class TigerWorkspaceAttributes implements IWorkspaceAttributesService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {}

    public elements(): IElementsQueryFactory {
        return new TigerWorkspaceElements(this.authCall, this.workspace);
    }

    public getAttributeDisplayForm = async (ref: ObjRef): Promise<IAttributeDisplayFormMetadataObject> => {
        return this.authCall(async () =>
            newAttributeDisplayFormMetadataObject(ref, (df) =>
                df.title("Display form").attribute(idRef("attr.dummy")),
            ),
        );
    };

    public getAttribute = async (ref: ObjRef): Promise<IAttributeMetadataObject> => {
        return this.authCall(async () => newAttributeMetadataObject(ref, (att) => att.title("dummyTitle")));
    };

    getCommonAttributes(): Promise<ObjRef[]> {
        throw new NotSupported("not supported");
    }

    getCommonAttributesBatch(): Promise<ObjRef[][]> {
        throw new NotSupported("not supported");
    }

    getAttributeDisplayForms(_: ObjRef[]): Promise<IAttributeDisplayFormMetadataObject[]> {
        throw new NotSupported("not supported");
    }

    getAttributes(_: ObjRef[]): Promise<IAttributeMetadataObject[]> {
        throw new NotSupported("not supported");
    }
}
