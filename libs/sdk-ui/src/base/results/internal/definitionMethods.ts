// (C) 2019-2020 GoodData Corporation
import { IAttribute, IBucket, IMeasure } from "@gooddata/sdk-model";

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
