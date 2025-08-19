// (C) 2019-2025 GoodData Corporation

import {
    IMeasureExpressionToken,
    IMeasureKeyDrivers,
    IMeasureReferencing,
    IWorkspaceMeasuresService,
    NotSupported,
} from "@gooddata/sdk-backend-spi";
import { IMeasureMetadataObject, IMeasureMetadataObjectDefinition, ObjRef } from "@gooddata/sdk-model";

/**
 * @internal
 */
export class RecordedMeasures implements IWorkspaceMeasuresService {
    public getMeasureExpressionTokens(_: ObjRef): Promise<IMeasureExpressionToken[]> {
        throw new NotSupported("not supported");
    }

    computeKeyDrivers(): Promise<IMeasureKeyDrivers> {
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
}
