// (C) 2019-2026 GoodData Corporation

import {
    type IMeasureExpressionToken,
    type IMeasureKeyDrivers,
    type IMeasureReferencing,
    type IMeasuresQuery,
    type IWorkspaceMeasuresService,
    NotSupported,
} from "@gooddata/sdk-backend-spi";
import {
    type IMeasure,
    type IMeasureMetadataObject,
    type IMeasureMetadataObjectDefinition,
    type IObjectCertificationWrite,
    type ObjRef,
} from "@gooddata/sdk-model";

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

    updateMeasureMeta(_: IMeasureMetadataObject): Promise<IMeasureMetadataObject> {
        throw new NotSupported("not supported");
    }

    setCertification(_ref: ObjRef, _certification?: IObjectCertificationWrite): Promise<void> {
        throw new NotSupported("not supported");
    }

    getMeasureReferencingObjects(_: ObjRef): Promise<IMeasureReferencing> {
        throw new NotSupported("not supported");
    }

    getMeasuresQuery(): IMeasuresQuery {
        throw new NotSupported("not supported");
    }

    getMeasure(_: ObjRef): Promise<IMeasureMetadataObject> {
        throw new NotSupported("not supported");
    }

    getConnectedAttributes(_definition: IMeasure): Promise<ObjRef[]> {
        throw new NotSupported("not supported");
    }
}
