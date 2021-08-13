// (C) 2019-2020 GoodData Corporation

import {
    IWorkspaceMeasuresService,
    NotSupported,
    IMeasureExpressionToken,
    IMeasureMetadataObject,
    IMeasureMetadataObjectDefinition,
} from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";

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
}
