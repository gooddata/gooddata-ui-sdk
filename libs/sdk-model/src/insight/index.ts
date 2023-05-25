// (C) 2019-2022 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";
import intersection from "lodash/intersection.js";
import { ISortItem, sortEntityIds, SortEntityIds } from "../execution/base/sort.js";
import {
    anyBucket,
    BucketItemModifications,
    BucketItemReducer,
    BucketPredicate,
    IAttributeOrMeasure,
    IBucket,
} from "../execution/buckets/index.js";
import { filterObjRef, IFilter, isAttributeFilter } from "../execution/filter/index.js";
import {
    anyMeasure,
    IMeasure,
    measureFilters,
    measureLocalId,
    MeasurePredicate,
} from "../execution/measure/index.js";
import {
    anyAttribute,
    attributeDisplayFormRef,
    attributeLocalId,
    AttributePredicate,
    IAttribute,
} from "../execution/attribute/index.js";
import { ITotal } from "../execution/base/totals.js";
import {
    bucketsAttributes,
    bucketsById,
    bucketsFind,
    bucketsItems,
    bucketsMeasures,
    bucketsModifyItem,
    bucketsReduceItem,
    bucketsTotals,
} from "../execution/buckets/bucketArray.js";
import { invariant } from "ts-invariant";
import { IColor } from "../colors/index.js";
import identity from "lodash/identity.js";
import { ObjRef, serializeObjRef } from "../objRef/index.js";
import flatMap from "lodash/flatMap.js";
import uniqBy from "lodash/uniqBy.js";
import { IUser } from "../user/index.js";
import { IAuditable } from "../base/metadata.js";

/**
 * Represents an Insight defined in GoodData platform. Insight is typically created using Analytical Designer
 * and can be embedded using UI SDK.
 *
 * @remarks
 * Insight contains all metadata needed to construct its visualization and perform execution to obtain data
 * for that visualization.
 *
 * @public
 */
export type IInsight = IInsightDefinition & {
    insight: IAuditable & {
        /**
         * Unique identifier of the Insight
         */
        identifier: string;

        /**
         * Link to the insight.
         */
        uri: string;

        /**
         * Object to use when referencing insight.
         */
        ref: ObjRef;

        /**
         * Insight is locked for editing & deleting
         */
        isLocked?: boolean;
    };
};

/**
 * Insight definition specifies what and how should be visualized by an insight.
 *
 * @public
 */
export type IInsightDefinition = {
    insight: {
        /**
         * User-assigned title of this insight
         */
        title: string;

        /**
         * Insight tags.
         *
         * @remarks
         * This property is optional for backwards compatibility reasons, but for newly created insights,
         * you can expect this to always be defined (an empty array in case there are no tags).
         *
         * Added in 8.6.0
         */
        tags?: string[];

        /**
         * Insight summary.
         *
         * @remarks
         * This property is optional for backwards compatibility reasons, but for newly created insights,
         * you can expect this to always be defined (an empty string in case there are no summary).
         *
         * Added in 8.9.0
         */
        summary?: string;

        /**
         * URL of visualization that should be used to render this insight. This is a link to the location
         * where the visualization assets are stored and where they should be loaded and linked from.
         *
         * Note: at the moment, the SDK supports only compile-time linkage; for this the visualization URL
         * is in format "local:visName" (as in "local:bar" for BarChart)
         *
         * @alpha
         */
        visualizationUrl: string;

        /**
         * Buckets of attributes, measures and totals to render on the visualization.
         */
        buckets: IBucket[];

        /**
         * Filters to apply on the data.
         */
        filters: IFilter[];

        /**
         * Sorting to apply on the data.
         */
        sorts: ISortItem[];

        /**
         * Visualization-specific properties. This object MAY contain customization metadata for this insight such as:
         *
         * - what axis to display on a chart
         * - whether to display legend
         * - how to color the chart
         *
         * These properties vary from visualization to visualization. Backend does not process the properties in
         * any way.
         */
        properties: VisualizationProperties;
    };
};

/**
 * Object defining the {@link IVisualizationClass} object body.
 *
 * @public
 */
export interface IVisualizationClassBody {
    /**
     * Unique identifier of the visualization.
     */
    identifier: string;

    /**
     * Link to visualization class object.
     */
    uri: string;

    /**
     * Human readable name of the visualization (Bar Chart, Pivot Table)
     */
    title: string;

    /**
     * Link to where visualization's assets reside.
     *
     * This MAY contain URLs such as 'local:bar', 'local:table' - such URLs indicate that the visualization
     * is bundled with the GoodData.UI SDK.
     */
    url: string;

    /**
     * Visualization icon to display in Analytical Designer.
     */
    icon: string;

    /**
     * Visualization icon to display when user selects the visualization in Analytical Designer.
     */
    iconSelected: string;

    /**
     * Checksum for subresource integrity checking.
     *
     * {@link https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity}
     */
    checksum: string;

    /**
     * Override ordering in the visualization catalog.
     */
    orderIndex?: number;
}

/**
 * Visualization class is essentially a descriptor for particular type of visualization - say bar chart
 * or table.
 *
 * @remarks
 * Each available visualization type is described by a class stored in the metadata. The available
 * classes influence what visualizations can users select in Analytical Designer.
 *
 * @public
 */
export interface IVisualizationClass {
    visualizationClass: IVisualizationClassBody;
}

/**
 * Visualization-specific properties.
 *
 * @remarks
 * These are modelled in generic fashion as they vary visualization by visualization.
 *
 * @privateRemarks
 * TODO: add links to properties supported by our visualizations.
 *
 * @public
 */
export type VisualizationProperties = {
    [key: string]: any;
};

/**
 * An item in color mapping definition for an insight. The color mapping is stored in properties of those
 * insights that can be colored AND have color mapping specified by the user.
 *
 * @public
 */
export interface IColorMappingItem {
    id: string;
    color: IColor;
}

/**
 * Type guard checking whether the provided object is an {@link IColorMappingItem}.
 *
 * @public
 */
export function isColorMappingItem(obj: unknown): obj is IColorMappingItem {
    return !isEmpty(obj) && !!(obj as IColorMappingItem).color && !!(obj as IColorMappingItem).id;
}

//
// Type guards
//

/**
 * Type guard checking whether the provided object is an Insight.
 *
 * @public
 */
export function isInsight(obj: unknown): obj is IInsight {
    return !isEmpty(obj) && (obj as IInsight).insight !== undefined;
}

//
// Functions
//

/**
 * Finds bucket matching the provided predicate in an insight.
 *
 * @remarks
 * This function also provides convenience to find bucket by its local identifier - if you pass predicate as
 * string the function will automatically create idMatchBucket predicate.
 *
 * @param insight - insight to work with
 * @param idOrFun - local identifier or bucket predicate
 * @returns undefined if none match
 * @public
 */
export function insightBucket(
    insight: IInsightDefinition,
    idOrFun: string | BucketPredicate = anyBucket,
): IBucket | undefined {
    invariant(insight, "insight must be specified");

    return bucketsFind(insight.insight.buckets, idOrFun);
}

/**
 * Gets buckets for the insight. If ids are provided, then only returns buckets matching the ids.
 *
 * @param insight - insight to work with
 * @param ids - local identifiers of buckets
 * @returns empty list if none match
 * @public
 */
export function insightBuckets(insight: IInsightDefinition, ...ids: string[]): IBucket[] {
    invariant(insight, "insight must be specified");

    if (isEmpty(ids)) {
        return insight.insight.buckets;
    }

    return bucketsById(insight.insight.buckets, ...ids);
}

/**
 * Gets all attributes and measures used in the provided insight.
 *
 * @param insight - insight to work with
 * @returns empty if none
 * @public
 */
export function insightItems(insight: IInsightDefinition): IAttributeOrMeasure[] {
    invariant(insight, "insight must be specified");

    return bucketsItems(insight.insight.buckets);
}

/**
 * Gets all measures used in the provided insight.
 *
 * @param insight - insight to work with
 * @param measurePredicate - predicate to select measures satisfying some conditions
 * @returns empty if none
 * @public
 */
export function insightMeasures(
    insight: IInsightDefinition,
    measurePredicate: MeasurePredicate = anyMeasure,
): IMeasure[] {
    invariant(insight, "insight must be specified");

    return bucketsMeasures(insight.insight.buckets, measurePredicate);
}

/**
 * Tests whether insight uses any measures.
 *
 * @param insight - insight to test
 * @returns true if any measures, false if not
 * @public
 */
export function insightHasMeasures(insight: IInsightDefinition): boolean {
    invariant(insight, "insight must be specified");

    return insightMeasures(insight).length > 0;
}

/**
 * Gets all attributes used in the provided insight
 *
 * @param insight - insight to work with
 * @param attributePredicate - predicate to select attributes satisfying some conditions
 * @returns empty if none
 * @public
 */
export function insightAttributes(
    insight: IInsightDefinition,
    attributePredicate: AttributePredicate = anyAttribute,
): IAttribute[] {
    invariant(insight, "insight must be specified");

    return bucketsAttributes(insight.insight.buckets, attributePredicate);
}

/**
 * Tests whether insight uses any attributes
 *
 * @param insight - insight to test
 * @returns true if any measures, false if not
 * @public
 */
export function insightHasAttributes(insight: IInsightDefinition): boolean {
    invariant(insight, "insight must be specified");

    return insightAttributes(insight).length > 0;
}

/**
 * Tests whether insight contains valid definition of data to visualise - meaning at least one attribute or
 * one measure is defined in the insight.
 *
 * @param insight - insight to test
 * @returns true if at least one measure or attribute, false if none
 * @public
 */
export function insightHasDataDefined(insight: IInsightDefinition): boolean {
    invariant(insight, "insight must be specified");

    return (
        insight.insight.buckets.length > 0 && (insightHasMeasures(insight) || insightHasAttributes(insight))
    );
}

/**
 * Gets filters used in an insight.
 *
 * @param insight - insight to work with
 * @public
 */
export function insightFilters(insight: IInsightDefinition): IFilter[] {
    invariant(insight, "insight must be specified");

    return insight.insight.filters;
}

/**
 * Gets sorting defined in the insight.
 *
 * @remarks
 * Note: this function ensures that only sorts working on top of attributes and measures defined in the
 * insight will be returned. Any invalid entries will be stripped.
 *
 * @param insight - insight to get sorts from
 * @returns array of valid sorts
 * @public
 */
export function insightSorts(insight: IInsightDefinition): ISortItem[] {
    invariant(insight, "insight must be specified");

    const attributeIds = insightAttributes(insight).map(attributeLocalId);
    const measureIds = insightMeasures(insight).map(measureLocalId);

    function contains(arr1: string[], arr2: string[]): boolean {
        return intersection(arr1, arr2).length === arr2.length;
    }

    return insight.insight.sorts.filter((s) => {
        const entities: SortEntityIds = sortEntityIds(s);

        return (
            contains(attributeIds, entities.attributeIdentifiers) &&
            contains(measureIds, entities.measureIdentifiers)
        );
    });
}

/**
 * Gets all totals defined in the insight
 *
 * @param insight - insight to get totals from
 * @returns empty if none
 * @public
 */
export function insightTotals(insight: IInsightDefinition): ITotal[] {
    invariant(insight, "insight must be specified");

    return bucketsTotals(insight.insight.buckets);
}

/**
 * Gets visualization properties of an insight.
 *
 * @param insight - insight to get vis properties for
 * @returns empty object is no properties
 * @public
 */
export function insightProperties(insight: IInsightDefinition): VisualizationProperties {
    invariant(insight, "insight must be specified");

    return insight.insight.properties;
}

/**
 * Gets URL of visualization that should be used to render this insight. This is a link to the location
 * where the visualization assets are stored and where they should be loaded and linked from.
 *
 * Note: at the moment, the SDK supports only compile-time linkage; for this the visualization URL
 * is in format "local:visName" (as in "local:bar" for BarChart)
 *
 * @param insight - insight to get visualization URL from
 * @alpha
 */
export function insightVisualizationUrl(insight: IInsightDefinition): string {
    invariant(insight, "insight to get vis class URI from must be specified");

    return insight.insight.visualizationUrl;
}

/**
 *
 * @param insight - insight to get visualization type
 * @alpha
 */
export function insightVisualizationType(insight: IInsightDefinition): string {
    invariant(insight, "insight to get vis type must be specified");

    return insightVisualizationUrl(insight)?.split(":")[1] || "";
}

/**
 * Gets the insight title
 *
 * @param insight - insight to get title of
 * @returns the insight title
 * @public
 */
export function insightTitle(insight: IInsightDefinition): string {
    invariant(insight, "insight to get title from must be specified");

    return insight.insight.title;
}

/**
 * Gets the insights tags from the tagging system
 *
 * @param insight - insight to get the tags of
 * @returns the insight tags or aan empty array if none are specified
 * @public
 */
export function insightTags(insight: IInsightDefinition): string[] {
    invariant(insight, "insight must be specified");

    return insight.insight.tags ?? [];
}

/**
 * Gets the insights summary
 *
 * @param insight - insight to get the summary of
 * @returns the insight summary or an empty string if is not specified
 * @public
 */
export function insightSummary(insight: IInsightDefinition): string {
    invariant(insight, "insight must be specified");

    return insight.insight.summary ?? "";
}

/**
 * Gets opaque reference to the insight.
 *
 * @param insight - insight to get ref of
 * @public
 */
export function insightRef(insight: IInsight): ObjRef {
    invariant(insight, "insight to get ref of must be specified");

    return insight.insight.ref;
}

/**
 * Gets the insight id
 *
 * @param insight - insight to get id of
 * @returns the insight id
 * @public
 */
export function insightId(insight: IInsight): string {
    invariant(insight, "insight to get id of must be specified");

    return insight.insight.identifier;
}

/**
 * Gets the insight uri
 *
 * @param insight - insight to get uri of
 * @returns the insight uri
 * @public
 */
export function insightUri(insight: IInsight): string {
    invariant(insight, "insight to get uri of must be specified");

    return insight.insight.uri;
}

/**
 * Gets the date when the insight was created
 *
 * @param insight - insight
 * @returns string - YYYY-MM-DD HH:mm:ss
 * @public
 */
export function insightCreated(insight: IInsight): string | undefined {
    invariant(insight, "insight must be specified");

    return insight.insight.created;
}

/**
 * Gets the user that created the insight
 *
 * @param insight - insight
 * @returns string
 * @public
 */
export function insightCreatedBy(insight: IInsight): IUser | undefined {
    invariant(insight, "insight must be specified");

    return insight.insight.createdBy;
}

/**
 * Gets the date of the last insight update
 *
 * @param insight - insight
 * @returns string - YYYY-MM-DD HH:mm:ss
 * @public
 */
export function insightUpdated(insight: IInsight): string | undefined {
    invariant(insight, "insight must be specified");

    return insight.insight.updated;
}

/**
 * Gets the user that last updated the insight
 *
 * @param insight - insight
 * @returns string
 * @public
 */
export function insightUpdatedBy(insight: IInsight): IUser | undefined {
    invariant(insight, "insight must be specified");

    return insight.insight.updatedBy;
}

/**
 * Checks if insight is locked
 *
 * @param insight - insight
 * @returns boolean
 * @public
 */
export function insightIsLocked(insight: IInsight): boolean {
    invariant(insight, "insight must be specified");

    return insight.insight.isLocked || false;
}

/**
 * Gets a new insight that 'inherits' all data from the provided insight but has different properties.
 *
 * @remarks
 * New properties will be used in the new insight as-is, no merging with existing properties.
 *
 * @param insight - insight to work with
 * @param properties - new properties to have on the new insight
 * @returns always new instance
 * @public
 */
export function insightSetProperties<T extends IInsightDefinition>(
    insight: T,
    properties: VisualizationProperties = {},
): T {
    invariant(insight, "insight must be specified");

    return {
        insight: {
            ...insight.insight,
            properties,
        },
    } as T;
}

/**
 * Gets a new insight that 'inherits' all data from the provided insight but has different sorts.
 *
 * @remarks
 * New sorts will be used in the new insight as-is, no merging with existing sorts.
 *
 * @param insight - insight to work with
 * @param sorts - new sorts to apply
 * @returns always new instance
 * @public
 */
export function insightSetSorts<T extends IInsightDefinition>(insight: T, sorts: ISortItem[] = []): T {
    invariant(insight, "insight must be specified");

    return {
        insight: {
            ...insight.insight,
            sorts,
        },
    } as T;
}

/**
 * Gets a new insight that 'inherits' all data from the provided insight but has different filters.
 *
 * @remarks
 * New filters will be used in the new insight as-is, no merging with existing filters.
 *
 * @param insight - insight to work with
 * @param filters - new filters to apply
 * @returns always new instance
 * @public
 */
export function insightSetFilters<T extends IInsightDefinition>(insight: T, filters: IFilter[] = []): T {
    invariant(insight, "insight must be specified");

    return {
        insight: {
            ...insight.insight,
            filters,
        },
    } as T;
}

/**
 * Gets a new insight that 'inherits' all data from the provided insight but has different buckets.
 *
 * @remarks
 * New buckets will be used in the new insight as-is, no merging with existing buckets.
 *
 * @param insight - insight to work with
 * @param buckets - new buckets to apply
 * @returns always new instance
 * @public
 */
export function insightSetBuckets<T extends IInsightDefinition>(
    insight: T,
    buckets: IBucket[] | undefined = [],
): T {
    invariant(insight, "insight must be specified");

    return {
        insight: {
            ...insight.insight,
            buckets,
        },
    } as T;
}

/**
 * Creates a new insight with modified bucket items (retrieved by applying the modifications function to each bucketItem in the insight).
 *
 * @remarks
 * Note: the bucket item modification function SHOULD NOT modify bucket item's localId.
 * The localId MAY be used to reference the item from other places in the insight (for example from sorts).
 * Changing the item localId has potential to break the insight: as-is this function does not concern itself with changing the references.
 *
 * @param insight - insight to use as template for the new insight
 * @param modifications - modifications to apply to the bucket items
 * @returns always new instance
 * @public
 */
export function insightModifyItems<T extends IInsightDefinition>(
    insight: T,
    modifications: BucketItemModifications = identity,
): T {
    invariant(insight, "insight must be specified");
    const buckets: IBucket[] = insightBuckets(insight);
    return {
        insight: {
            ...insight.insight,
            buckets: bucketsModifyItem(buckets, modifications),
        },
    } as T;
}

/**
 * Creates a new insight with reduced bucket items (retrieved by applying the modifications function).
 *
 * @remarks
 * Note: the bucket item modification function SHOULD NOT modify bucket item's localId.
 * The localId MAY be used to reference the item from other places in the insight (for example from sorts).
 * Changing the item localId has potential to break the insight: as-is this function does not concern itself with changing the references.
 *
 * @param insight - insight to use as template for the new insight
 * @param reducer - reduce function to apply to the bucket items
 * @returns always new instance
 * @public
 */
export function insightReduceItems<T extends IInsightDefinition>(
    insight: T,
    reducer: BucketItemReducer = identity,
): T {
    invariant(insight, "insight must be specified");

    const buckets: IBucket[] = insightBuckets(insight);

    return {
        insight: {
            ...insight.insight,
            buckets: bucketsReduceItem(buckets, reducer),
        },
    } as T;
}

/**
 * Contains breakdown of what display forms are used in an insight.
 *
 * @public
 */
export type InsightDisplayFormUsage = {
    /**
     * References to display forms used for slicing and dicing the results.
     */
    inAttributes: ObjRef[];

    /**
     * References to display forms used to filter the entire insight.
     */
    inFilters: ObjRef[];

    /**
     * References to display forms used to filter particular measures.
     */
    inMeasureFilters: ObjRef[];
};

/**
 * Gets references to all display forms used by the insight.
 *
 * @remarks
 * The display forms may be used for slicing or dicing the
 * data, for filtering the entire insight or for filtering just some measures.
 *
 * @param insight - insight to get the display form usage from
 * @public
 */
export function insightDisplayFormUsage<T extends IInsightDefinition>(insight: T): InsightDisplayFormUsage {
    invariant(insight, "insight must be specified");

    return {
        inAttributes: uniqBy(insightAttributes(insight).map(attributeDisplayFormRef), serializeObjRef),
        inFilters: uniqBy(
            insightFilters(insight)
                .filter(isAttributeFilter)
                .map((attributeFilter) => filterObjRef(attributeFilter)),
            serializeObjRef,
        ),
        inMeasureFilters: uniqBy(
            flatMap(insightMeasures(insight), (measure) => {
                const filters = measureFilters(measure) ?? [];

                return filters
                    .filter(isAttributeFilter)
                    .map((attributeFilter) => filterObjRef(attributeFilter));
            }),
            serializeObjRef,
        ),
    };
}

//
// Visualization class functions
//

/**
 * For given visualization class, return URL where the vis assets are stored.
 *
 * @param vc - visualization class
 * @returns never null, never empty
 * @public
 */
export function visClassUrl(vc: IVisualizationClass): string {
    invariant(vc, "vis class to get URL from must be specified");

    return vc.visualizationClass.url;
}

/**
 * For given visualization class, return its URI.
 *
 * @param vc - visualization class
 * @returns never null, never empty
 * @public
 */
export function visClassUri(vc: IVisualizationClass): string {
    invariant(vc, "vis class to get URI from must be specified");

    return vc.visualizationClass.uri;
}

/**
 * For given visualization class, return its identifier.
 *
 * @param vc - visualization class
 * @returns never null, never empty
 * @public
 */
export function visClassId(vc: IVisualizationClass): string {
    invariant(vc, "vis class to get URI from must be specified");

    return vc.visualizationClass.identifier;
}
