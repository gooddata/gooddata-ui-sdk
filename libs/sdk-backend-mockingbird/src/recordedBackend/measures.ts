// (C) 2019-2022 GoodData Corporation

import {
    IWorkspaceMeasuresService,
    NotSupported,
    IMeasureExpressionToken,
    IMeasureReferencing,
} from "@gooddata/sdk-backend-spi";
import {
    ObjRef,
    ICatalogMeasure,
    IMeasureMetadataObject,
    IMeasureMetadataObjectDefinition,
} from "@gooddata/sdk-model";

/**
 * @internal
 */
export class RecordedMeasures implements IWorkspaceMeasuresService {
    public getMeasureExpressionTokens(_: ObjRef): Promise<IMeasureExpressionToken[]> {
        throw new NotSupported("not supported");
    }

    createMeasure(_: IMeasureMetadataObjectDefinition): Promise<IMeasureMetadataObject> {
        throw new NotSupported("not supported");
    }

    deleteMeasure(_: ObjRef): Promise<void> {
        throw new NotSupported("not supported");
    }

    updateMeasure(_: IMeasureMetadataObject): Promise<IMeasureMetadataObject> {
        throw new NotSupported("not supported");
    }

    getMeasureReferencingObjects(_: ObjRef): Promise<IMeasureReferencing> {
        throw new NotSupported("not supported");
    }

    getCatalogMeasures(_measureRefs: ObjRef[]): Promise<ICatalogMeasure[]> {
        throw new NotSupported("not supported");
    }
}
