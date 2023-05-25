// (C) 2019-2022 GoodData Corporation
import {
    bucketIsEmpty,
    IAttribute,
    IBucket,
    idMatchMeasure,
    IExecutionDefinition,
    IMeasure,
    measureMasterIdentifier,
    bucketMeasures,
} from "@gooddata/sdk-model";
import findIndex from "lodash/findIndex.js";

/**
 * Methods to work with execution definition.
 *
 * @internal
 */
export interface IExecutionDefinitionMethods {
    /**
     * @returns attributes which were specified in execution definition that resulted in this data view
     */
    attributes(): IAttribute[];

    /**
     * @returns measures which were specified in execution definition that resulted in this data view
     */
    measures(): IMeasure[];

    /**
     * @returns buckets which were specified in execution definition that resulted in this data view; please note that
     *  buckets are an optional metadata included in an execution definition; buckets provide information how different
     *  measures and attributes that make up an execution are logically grouped; therefore keep in mind that it is
     *  completely valid that a data view is populated with data but has no bucket metadata at all.
     */
    buckets(): IBucket[];

    /**
     * Returns bucket by its local identifier.
     *
     * @param localId - desired bucket's local identifier
     * @returns undefined if no such bucket
     */
    bucket(localId: string): IBucket | undefined;

    /**
     * @returns number of buckets which were specified in execution definition that resulted in this data view
     */
    bucketCount(): number;

    /**
     * A convenience function that tests whether any buckets were specified in the execution definition that resulted
     * in this data view.
     *
     * @returns true if any buckets, false otherwise
     */
    hasBuckets(): boolean;

    /**
     * A convenience function that tests whether a bucket is either missing from execution definition that
     * resulted in this data view or the bucket exists and is empty.
     *
     * @param localId - desired bucket's local identifier
     * @returns true if bucket with the provided local identifier both exists and is non empty.
     */
    isBucketEmpty(localId: string): boolean;

    /**
     * A convenience function that locates bucket by local identifier and if found returns measures
     * contained in that bucket.
     *
     * @param localId - desired bucket's local identifier
     * @returns array of measures in the bucket, empty array if no such bucket or if the bucket is empty or if
     *  the bucket contains no measures
     */
    bucketMeasures(localId: string): IMeasure[];

    /**
     * Finds a measure with the provided local identifier within the execution definition that resulted
     * in this data view.
     *
     * @param localId - desired measure's local identifier
     * @returns undefined if no such measure found
     */
    measure(localId: string): IMeasure | undefined;

    /**
     * Finds index of measure with the provided local identifier with the execution definition that
     * resulted in this data view.
     *
     * @param localId - desired measure's local identifier
     * @returns index within list of measures, -1 if no such measure
     */
    measureIndex(localId: string): number;

    /**
     * Given a local identifier of a measure in execution definition, this method will return master measure from which
     * the measure is derived. IF the measure with the provided identifier is not derived, then it itself
     * is returned.
     *
     * @param localId - desired measure's local identifier
     * @returns undefined if no measure with provided local id exists in the execution definition OR if measure exists, it is
     *  derived but master measure does not exist in the execution definition
     */
    masterMeasureForDerived(localId: string): IMeasure | undefined;

    /**
     * @returns true if execution definition that resulted in this data view has any attributes
     */
    hasAttributes(): boolean;
}

//
// Default implementation
//

type BucketIndex = {
    [key: string]: IBucket;
};

function buildBucketIndex(definition: IExecutionDefinition): BucketIndex {
    return definition.buckets.reduce((acc: BucketIndex, val) => {
        const id = val.localIdentifier ? val.localIdentifier : "unknown";
        acc[id] = val;
        return acc;
    }, {});
}

class ExecutionDefinitonMethods implements IExecutionDefinitionMethods {
    /*
     * Derived property; bucket id => bucket
     */
    private readonly _bucketByLocalId: BucketIndex;

    constructor(private readonly definition: IExecutionDefinition) {
        this._bucketByLocalId = buildBucketIndex(definition);
    }

    public attributes(): IAttribute[] {
        return this.definition.attributes;
    }

    public measures(): IMeasure[] {
        return this.definition.measures;
    }

    public buckets(): IBucket[] {
        return this.definition.buckets;
    }

    public bucket(localId: string): IBucket | undefined {
        if (!localId) {
            return undefined;
        }

        return this._bucketByLocalId[localId];
    }

    public bucketCount(): number {
        return this.definition.buckets.length;
    }

    public hasBuckets(): boolean {
        return this.bucketCount() > 0;
    }

    public isBucketEmpty(localId: string): boolean {
        const bucket = this._bucketByLocalId[localId];

        if (!bucket) {
            return true;
        }

        return bucketIsEmpty(this._bucketByLocalId[localId]);
    }

    public bucketMeasures(localId: string): IMeasure[] {
        const bucket = this._bucketByLocalId[localId];

        if (!bucket) {
            return [];
        }

        return bucketMeasures(this._bucketByLocalId[localId]);
    }

    public measure(localId: string): IMeasure | undefined {
        return this.definition.measures.find(idMatchMeasure(localId));
    }

    public measureIndex(localId: string): number {
        return findIndex(this.definition.measures, idMatchMeasure(localId));
    }

    public masterMeasureForDerived(localId: string): IMeasure | undefined {
        const measure = this.measure(localId);

        if (!measure) {
            return;
        }

        const masterMeasureId = measureMasterIdentifier(measure);

        if (!masterMeasureId) {
            // TODO: revisit; this is weird but existing callers used to rely on the behavior;
            //  perhaps rename method?

            return measure;
        }

        return this.measure(masterMeasureId);
    }

    public hasAttributes(): boolean {
        return this.definition.attributes.length > 0;
    }
}

export function newExecutionDefinitonMethods(definition: IExecutionDefinition): IExecutionDefinitionMethods {
    return new ExecutionDefinitonMethods(definition);
}
