// (C) 2026 GoodData Corporation

import {
    type IGetMeasureOptions,
    type IMeasureExpressionToken,
    type IMeasureKeyDrivers,
    type IMeasureReferencing,
    type IMeasuresQuery,
    type IWorkspaceMeasuresService,
} from "@gooddata/sdk-backend-spi";
import {
    type IMeasure,
    type IMeasureMetadataObject,
    type IMeasureMetadataObjectDefinition,
    type IMetadataObjectBase,
    type IMetadataObjectIdentity,
    type IObjectCertificationWrite,
    type ObjRef,
} from "@gooddata/sdk-model";

/**
 * @alpha
 */
export abstract class DecoratedWorkspaceMeasuresService implements IWorkspaceMeasuresService {
    protected constructor(protected readonly decorated: IWorkspaceMeasuresService) {}

    computeKeyDrivers(
        measure: IMeasure,
        options?: {
            sortDirection: "ASC" | "DESC";
        },
    ): Promise<IMeasureKeyDrivers> {
        return this.decorated.computeKeyDrivers(measure, options);
    }

    getMeasureExpressionTokens(ref: ObjRef): Promise<IMeasureExpressionToken[]> {
        return this.decorated.getMeasureExpressionTokens(ref);
    }

    createMeasure(measure: IMeasureMetadataObjectDefinition): Promise<IMeasureMetadataObject> {
        return this.decorated.createMeasure(measure);
    }

    updateMeasure(measure: IMeasureMetadataObject): Promise<IMeasureMetadataObject> {
        return this.decorated.updateMeasure(measure);
    }

    updateMeasureMeta(
        measure: Partial<IMetadataObjectBase> & IMetadataObjectIdentity,
    ): Promise<IMeasureMetadataObject> {
        return this.decorated.updateMeasureMeta(measure);
    }

    setCertification(ref: ObjRef, certification?: IObjectCertificationWrite): Promise<void> {
        return this.decorated.setCertification(ref, certification);
    }

    deleteMeasure(measureRef: ObjRef): Promise<void> {
        return this.decorated.deleteMeasure(measureRef);
    }

    getMeasureReferencingObjects(measureRef: ObjRef): Promise<IMeasureReferencing> {
        return this.decorated.getMeasureReferencingObjects(measureRef);
    }

    getMeasuresQuery(): IMeasuresQuery {
        return this.decorated.getMeasuresQuery();
    }

    getMeasure(ref: ObjRef, options?: IGetMeasureOptions): Promise<IMeasureMetadataObject> {
        return this.decorated.getMeasure(ref, options);
    }

    getConnectedAttributes(definition: IMeasure, auxMeasures?: IMeasure[]): Promise<ObjRef[]> {
        return this.decorated.getConnectedAttributes(definition, auxMeasures);
    }
}
