// (C) 2019-2025 GoodData Corporation

import { cloneDeep, isEmpty, set } from "lodash-es";
import { type WrappedComponentProps } from "react-intl";

import { type IExecutionFactory } from "@gooddata/sdk-backend-spi";
import {
    type AttributeDisplayFormType,
    type IInsightDefinition,
    type ISortItem,
    type ITheme,
    type ObjRef,
    attributeAlias,
    attributeDisplayFormRef,
    attributeLocalId,
    bucketAttribute,
    idRef,
    insightBucket,
    insightBuckets,
    insightFilters,
    insightHasDataDefined,
    isUriRef,
    newAttribute,
    newAttributeSort,
    newBucket,
    uriRef,
} from "@gooddata/sdk-model";
import { BucketNames, VisualizationTypes } from "@gooddata/sdk-ui";
import {
    CoreGeoChart,
    type ICoreGeoChartProps,
    type IGeoConfig,
    getGeoChartDimensions,
} from "@gooddata/sdk-ui-geo";

import { ATTRIBUTE, BUCKETS, METRIC } from "../../../constants/bucket.js";
import { ANALYTICAL_ENVIRONMENT, DASHBOARDS_ENVIRONMENT } from "../../../constants/properties.js";
import { GEOPUSHPIN_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties.js";
import { GEO_PUSHPIN_CHART_UICONFIG } from "../../../constants/uiConfig.js";
import {
    EmptyAfmSdkError,
    type IBucketItem,
    type IBucketOfFun,
    type IExtendedReferencePoint,
    type IReferencePoint,
    type IUiConfig,
    type IVisConstruct,
    type IVisProps,
    type IVisualizationProperties,
} from "../../../interfaces/Visualization.js";
import { configurePercent } from "../../../utils/bucketConfig.js";
import {
    getAllMeasures,
    getAttributeItemsWithoutStacks,
    getItemsCount,
    getItemsFromBuckets,
    getPreferredBucketItems,
    isDateBucketItem,
    limitNumberOfMeasuresInBuckets,
    removeAllArithmeticMeasuresFromDerived,
    removeAllDerivedMeasures,
    removeShowOnSecondaryAxis,
} from "../../../utils/bucketHelper.js";
import { removeSort } from "../../../utils/sort.js";
import {
    setGeoPushpinUiConfig,
    updateConfigWithSettings,
} from "../../../utils/uiConfigHelpers/geoPushpinChartUiConfigHelper.js";
import { GeoPushpinConfigurationPanel } from "../../configurationPanels/GeoPushpinConfigurationPanel.js";
import { PluggableBaseChart } from "../baseChart/PluggableBaseChart.js";

const NUMBER_MEASURES_IN_BUCKETS_LIMIT = 2;

/**
 * PluggableGeoPushpinChart
 *
 * ## Buckets
 *
 * | Name        | Id          | Accepts                                                       |
 * |-------------|-------------|---------------------------------------------------------------|
 * | Location    | location    | geo attributes only                                           |
 * | Latitude    | latitude    | geo attributes only, added internally, not accessible from UI |
 * | Longitude   | longitude   | geo attributes only, added internally, not accessible from UI |
 * | Size        | size        | measures only                                                 |
 * | Color       | color       | measures only                                                 |
 * | Segment     | segment     | attributes only                                               |
 * | TooltipText | tooltipText | attributes only, added internally, not accessible from UI     |
 *
 * Internal buckets are used only for execution, they never exist in reference point.
 * In ref. point they are represented by items in properties
 *
 * ### Bucket axioms
 *
 * - |Location| = 1
 * - |Size| ≤ 1
 * - |Color| ≤ 1
 * - |Segment| ≤ 1
 *
 * ## Dimensions
 *
 * The PluggableGeoPushpinChart creates either one- or two-dimensional execution.
 *
 * In the case when latitude and longitude is in the one string label, delimited by ";":
 * - |Size| + |Color| ≥ 1 ⇒ [[MeasureGroupIdentifier], [Location, Segment, TooltipText]]
 * - |Size| + |Color| = 0 ⇒ [[Location, Segment, TooltipText]]
 *
 * In the case when latitude and longitude is in two numerical separate labels:
 * - |Size| + |Color| ≥ 1 ⇒ [[MeasureGroupIdentifier], [Latitude, Longitude, Segment, TooltipText]]
 * - |Size| + |Color| = 0 ⇒ [[Latitude, Longitude, Segment, TooltipText]]
 *
 * ## Sorts
 *
 * Unless the user specifies otherwise, the sorts used by default are:
 *
 * - |Segment| ≥ 1 ⇒ [attributeSort(Segment[0])]
 */
export class PluggableGeoPushpinChart extends PluggableBaseChart {
    constructor(props: IVisConstruct) {
        super(props);

        this.type = VisualizationTypes.PUSHPIN;
        this.initializeProperties(props.visualizationProperties);
    }

    protected override checkBeforeRender(insight: IInsightDefinition): boolean {
        if (!insightHasDataDefined(insight)) {
            throw new EmptyAfmSdkError();
        }

        return true;
    }

    public override getExtendedReferencePoint(
        referencePoint: IReferencePoint,
    ): Promise<IExtendedReferencePoint> {
        return super
            .getExtendedReferencePoint(referencePoint)
            .then((extendedReferencePoint: IExtendedReferencePoint) => {
                let newReferencePoint: IExtendedReferencePoint = setGeoPushpinUiConfig(
                    extendedReferencePoint,
                    this.intl,
                    this.type,
                );
                newReferencePoint = configurePercent(newReferencePoint, true);
                newReferencePoint = removeSort(newReferencePoint);
                return this.updateSupportedProperties(newReferencePoint);
            });
    }

    public override getUiConfig(): IUiConfig {
        const config = cloneDeep(GEO_PUSHPIN_CHART_UICONFIG);
        this.addMetricToFiltersIfEnabled(config);
        return config;
    }

    public override getExecution(
        options: IVisProps,
        insight: IInsightDefinition,
        executionFactory: IExecutionFactory,
    ) {
        const { executionConfig } = options;
        const buckets = this.prepareBuckets(insight);

        return executionFactory
            .forBuckets(buckets, insightFilters(insight))
            .withDimensions(getGeoChartDimensions)
            .withSorting(...this.createSort(insight))
            .withExecConfig(executionConfig);
    }

    protected override getSupportedPropertiesList(): string[] {
        return GEOPUSHPIN_SUPPORTED_PROPERTIES;
    }

    protected override configureBuckets(
        extendedReferencePoint: IExtendedReferencePoint,
    ): IExtendedReferencePoint {
        const newExtendedReferencePoint: IExtendedReferencePoint =
            this.sanitizeMeasures(extendedReferencePoint);
        const buckets: IBucketOfFun[] = limitNumberOfMeasuresInBuckets(
            newExtendedReferencePoint.buckets,
            NUMBER_MEASURES_IN_BUCKETS_LIMIT,
        );
        const allMeasures: IBucketItem[] = getAllMeasures(buckets);
        const primaryMeasures: IBucketItem[] = getPreferredBucketItems(
            buckets,
            [BucketNames.MEASURES, BucketNames.SIZE],
            [METRIC],
        );
        const secondaryMeasures: IBucketItem[] = getPreferredBucketItems(
            buckets,
            [BucketNames.SECONDARY_MEASURES, BucketNames.COLOR],
            [METRIC],
        );
        const sizeMeasures: IBucketItem[] = (
            primaryMeasures.length > 0
                ? primaryMeasures
                : allMeasures.filter((measure: IBucketItem): boolean => !secondaryMeasures.includes(measure))
        ).slice(0, this.getPreferredBucketItemLimit(BucketNames.SIZE));

        const colorMeasures: IBucketItem[] = (
            secondaryMeasures.length > 0
                ? secondaryMeasures
                : allMeasures.filter((measure: IBucketItem): boolean => !sizeMeasures.includes(measure))
        ).slice(0, this.getPreferredBucketItemLimit(BucketNames.COLOR));

        set(newExtendedReferencePoint, BUCKETS, [
            {
                localIdentifier: BucketNames.LOCATION,
                items: this.getLocationItems(buckets),
            },
            {
                localIdentifier: BucketNames.SIZE,
                items: removeShowOnSecondaryAxis(sizeMeasures),
            },
            {
                localIdentifier: BucketNames.COLOR,
                items: removeShowOnSecondaryAxis(colorMeasures),
            },
            {
                localIdentifier: BucketNames.SEGMENT,
                items: this.getSegmentItems(buckets),
            },
        ]);
        return newExtendedReferencePoint;
    }

    protected override renderConfigurationPanel(insight: IInsightDefinition, options: IVisProps): void {
        const configPanelElement = this.getConfigPanelElement();

        // NOTE: using pushData directly; no handlePushData here as in other visualizations.
        if (configPanelElement) {
            this.renderFun(
                <GeoPushpinConfigurationPanel
                    locale={this.locale}
                    pushData={this.pushData}
                    properties={this.visualizationProperties}
                    references={this.references}
                    propertiesMeta={this.propertiesMeta}
                    insight={insight}
                    colors={this.colors}
                    type={this.type}
                    isError={this.getIsError()}
                    isLoading={this.isLoading}
                    featureFlags={this.featureFlags}
                    configurationPanelRenderers={options.custom?.configurationPanelRenderers}
                />,
                configPanelElement,
            );
        }
    }

    protected override buildVisualizationConfig(
        options: IVisProps,
        supportedControls: IVisualizationProperties,
    ): IGeoConfig {
        const { config = {}, customVisualizationConfig = {} } = options;
        const { center, legend, viewport = {} } = supportedControls;
        const { colorMapping } = super.buildVisualizationConfig(options, supportedControls);
        const centerProp = center ? { center } : {};
        const legendProp = legend ? { legend } : {};
        const { isInEditMode, isExportMode } = config;
        if (this.environment === DASHBOARDS_ENVIRONMENT) {
            set(supportedControls, "legend.responsive", "autoPositionWithPopup");
        }
        const viewportProp = {
            viewport: {
                ...viewport,
                frozen: isInEditMode || isExportMode,
            },
        };
        const geoChartConfig = {
            ...config,
            ...centerProp,
            ...legendProp,
            ...viewportProp,
        };
        const isKDInViewMode = this.environment !== ANALYTICAL_ENVIRONMENT && !isInEditMode;
        const cooperativeGestures =
            customVisualizationConfig?.cooperativeGestures === undefined
                ? isKDInViewMode
                : customVisualizationConfig.cooperativeGestures;
        return {
            separators: config.separators,
            colorPalette: config.colorPalette,
            mapboxToken: config.mapboxToken,
            ...supportedControls,
            ...geoChartConfig,
            colorMapping,
            ...customVisualizationConfig,
            cooperativeGestures,
        };
    }

    protected override renderVisualization(
        options: IVisProps,
        insight: IInsightDefinition,
        executionFactory: IExecutionFactory,
    ): void {
        const { dimensions = { height: undefined }, custom = {}, locale, theme } = options;
        const { height } = dimensions;
        const { intl } = this;

        // keep height undef for AD; causes indigo-visualizations to pick default 100%
        const resultingHeight = this.environment === DASHBOARDS_ENVIRONMENT ? height : undefined;
        const { drillableItems } = custom;
        const supportedControls = this.visualizationProperties.controls || {};
        const fullConfig = this.buildVisualizationConfig(options, supportedControls);
        const execution = this.getExecution(options, insight, executionFactory);

        const geoPushpinProps: ICoreGeoChartProps & WrappedComponentProps & { theme: ITheme } = {
            drillableItems,
            config: updateConfigWithSettings(fullConfig, this.featureFlags),
            height: resultingHeight,
            intl,
            locale,
            execution,
            pushData: this.handlePushData,
            afterRender: this.afterRender,
            onDrill: this.onDrill,
            onError: this.onError,
            onExportReady: this.onExportReady,
            onLoadingChanged: this.onLoadingChanged,
            onDataView: this.onDataView,
            LoadingComponent: null,
            ErrorComponent: null,
            theme,
            enableExecutionCancelling: fullConfig.enableExecutionCancelling ?? false,
        };

        this.renderFun(<CoreGeoChart {...geoPushpinProps} />, this.getElement());
    }

    private withEmptyAttributeTargets(data: any) {
        return {
            ...data.availableDrillTargets,
            attributes: [],
        };
    }

    // This is effectively calling super.handlePushData()
    // https://stackoverflow.com/questions/31088947/inheritance-method-call-triggers-typescript-compiler-error
    // https://github.com/basarat/typescript-book/blob/master/docs/arrow-functions.md#tip-arrow-functions-and-inheritance
    // with new TS we got Property 'handlePushData' is used before its initialization.ts(2729)
    // it is not possible to call super.handlePushData() directly and get reference to this.handlePushData in constructor
    // tested in runtime and it works
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    private superHandlePushData = this.handlePushData;

    protected override handlePushData = (data: any): void => {
        // For pushpin chart we do not support drilling from attributes.
        this.superHandlePushData({
            ...data,
            ...(data.availableDrillTargets && {
                availableDrillTargets: this.withEmptyAttributeTargets(data),
            }),
        });
    };

    private sanitizeMeasures(extendedReferencePoint: IExtendedReferencePoint): IExtendedReferencePoint {
        const newExtendedReferencePoint: IExtendedReferencePoint =
            removeAllArithmeticMeasuresFromDerived(extendedReferencePoint);
        return removeAllDerivedMeasures(newExtendedReferencePoint);
    }

    private createSort(insight: IInsightDefinition): ISortItem[] {
        const bucket = insightBucket(insight, BucketNames.SEGMENT);
        const segmentAttribute = bucket && bucketAttribute(bucket);

        // sort by second attribute (1st: location, 2nd: segmentBy, 3rd: tooltipText)
        if (segmentAttribute) {
            return [newAttributeSort(segmentAttribute, "asc")];
        }

        return [];
    }

    private getSegmentItems(buckets: IBucketOfFun[]): IBucketItem[] {
        let segments = getPreferredBucketItems(
            buckets,
            [BucketNames.STACK, BucketNames.SEGMENT, BucketNames.COLUMNS],
            [ATTRIBUTE],
        );
        const nonSegmentAttributes = getAttributeItemsWithoutStacks(buckets);
        if (nonSegmentAttributes.length > 1 && isEmpty(segments)) {
            const locationItems = this.getLocationItems(buckets);
            segments = nonSegmentAttributes
                .filter((attribute) => !locationItems.includes(attribute))
                .filter((attribute) => !isDateBucketItem(attribute))
                .slice(0, 1);
        }
        return segments.slice(0, this.getPreferredBucketItemLimit(BucketNames.SEGMENT));
    }

    private getLocationItems(buckets: IBucketOfFun[]): IBucketItem[] {
        const locationItems: IBucketItem[] = getItemsFromBuckets(
            buckets,
            [BucketNames.ATTRIBUTE, BucketNames.VIEW, BucketNames.LOCATION, BucketNames.TREND],
            [ATTRIBUTE],
        ).filter((bucketItem) => Boolean(bucketItem.locationDisplayFormRef));

        return locationItems.slice(0, this.getPreferredBucketItemLimit(BucketNames.LOCATION));
    }

    private getPreferredBucketItemLimit(preferredBucket: string): number {
        const { buckets: bucketsUiConfig } = this.getUiConfig();
        return bucketsUiConfig[preferredBucket].itemsLimit;
    }

    private updateSupportedProperties(referencePoint: IExtendedReferencePoint): IExtendedReferencePoint {
        const buckets = referencePoint?.buckets ?? [];
        const locationItem = this.getLocationItems(buckets)[0];
        if (!locationItem) {
            return referencePoint;
        }
        const referencePointConfigured = cloneDeep(referencePoint);
        const visualizationProperties = this.visualizationProperties || {};
        const { controls = {} } = visualizationProperties;
        const hasSizeMeasure = getItemsCount(buckets, BucketNames.SIZE) > 0;
        const hasColorMeasure = getItemsCount(buckets, BucketNames.COLOR) > 0;
        const hasLocationAttribute = getItemsCount(buckets, BucketNames.LOCATION) > 0;
        const hasSegmentAttribute = getItemsCount(buckets, BucketNames.SEGMENT) > 0;
        const groupNearbyPoints =
            hasLocationAttribute && !hasColorMeasure && !hasSizeMeasure && !hasSegmentAttribute;
        const locationProperties = this.getLocationProperties(locationItem);

        set(referencePointConfigured, "properties", {
            controls: {
                points: {
                    groupNearbyPoints,
                },
                ...controls,
                ...locationProperties,
            },
        });

        if (this.references) {
            set(referencePointConfigured, "references", this.references);
        }
        return referencePointConfigured;
    }

    private getLocationProperties(locationItem: IBucketItem) {
        const { dfRef } = locationItem;
        // for tooltip, prefer standard text display form (whose type is `undefined`) over geo or hyperlink display forms
        const textDfs = locationItem.displayForms?.filter((displayForm) => !displayForm.type) ?? [];
        const defaultOrFirstTextDf = textDfs.find((displayForm) => !!displayForm.isDefault) || textDfs[0];
        const tooltipDfRef = defaultOrFirstTextDf?.ref || dfRef;
        const tooltipText = isUriRef(tooltipDfRef) ? tooltipDfRef.uri : tooltipDfRef.identifier;

        if (this.backendCapabilities.supportsSeparateLatitudeLongitudeLabels) {
            const latitudeDfRef = locationItem.displayForms?.find(
                (displayForm) => (displayForm.type as AttributeDisplayFormType) === "GDC.geo.pin_latitude",
            )?.ref;
            const longitudeDfRef = locationItem.displayForms?.find(
                (displayForm) => (displayForm.type as AttributeDisplayFormType) === "GDC.geo.pin_longitude",
            )?.ref;
            const latitude = isUriRef(latitudeDfRef) ? latitudeDfRef?.uri : latitudeDfRef?.identifier;
            const longitude = isUriRef(longitudeDfRef) ? longitudeDfRef?.uri : longitudeDfRef?.identifier;
            return {
                tooltipText,
                latitude,
                longitude,
            };
        }
        return {
            tooltipText,
        };
    }

    private prepareBuckets(insight: IInsightDefinition) {
        const supportedControls: IVisualizationProperties = this.visualizationProperties?.controls || {};

        // we need to shallow copy the buckets so that we can add more without mutating the original array
        const buckets = [...insightBuckets(insight)];

        if (supportedControls?.["tooltipText"]) {
            /*
             * The display form to use for tooltip text is provided in properties :( This is unfortunate; the chart
             * props could very well contain an extra prop for the tooltip bucket.
             *
             * Current guess is that this is because AD creates insight buckets; in order to create the tooltip
             * bucket, AD would have to actually show the tooltip bucket in the UI - which is not desired. Thus the
             * displayForm to add as bucket is passed in visualization properties.
             *
             * This workaround is highly unfortunate for two reasons:
             *
             * 1.  It leaks all the way to the API of geo chart: bucket geo does not have the tooltip bucket. Instead
             *     it duplicates then here logic in chart transform
             *
             * 2.  The executeVisualization endpoint is useless for GeoChart; cannot be used to render geo chart because
             *     the buckets stored in vis object are not complete. execVisualization takes buckets as is.
             */
            const tooltipText: string = supportedControls?.["tooltipText"];
            const bucket = this.createVirtualBucketFromLocationAttribute(
                insight,
                BucketNames.TOOLTIP_TEXT,
                tooltipText,
                "tooltipText_df",
            );
            if (bucket) {
                buckets.push(bucket);
            }
        }
        if (!this.backendCapabilities.supportsSeparateLatitudeLongitudeLabels) {
            return buckets;
        }

        if (supportedControls?.["latitude"]) {
            const latitude: string = supportedControls?.["latitude"];
            const bucket = this.createVirtualBucketFromLocationAttribute(
                insight,
                BucketNames.LATITUDE,
                latitude,
                // reuse local identifier of original item to keep references working, eg. ranking filter
            );
            if (bucket) {
                buckets.push(bucket);
            }
        }

        if (supportedControls?.["longitude"]) {
            const longitude: string = supportedControls?.["longitude"];
            const bucket = this.createVirtualBucketFromLocationAttribute(
                insight,
                BucketNames.LONGITUDE,
                longitude,
                "longitude_df",
            );
            if (bucket) {
                buckets.push(bucket);
            }
        }
        // do not include original LOCATION bucket (latitude would be duplicated and two executions
        // would be made because of how local IDs of attributes are normalized)
        return buckets.filter((bucket) => bucket.localIdentifier !== BucketNames.LOCATION);
    }

    /**
     * Creates new virtual bucket from existing LOCATION bucket
     * @param insight - current insight
     * @param bucketName - new bucket name
     * @param attributeId - id of bucket item
     * @param attributeLocalIdentifier - local identifier of bucket item, Location item one will be used if not defined
     */
    private createVirtualBucketFromLocationAttribute(
        insight: IInsightDefinition,
        bucketName: string,
        attributeId: string,
        attributeLocalIdentifier?: string,
    ) {
        const locationBucket = insightBucket(insight, BucketNames.LOCATION);

        if (locationBucket) {
            const attribute = bucketAttribute(locationBucket);
            if (attribute) {
                let ref: ObjRef = idRef(attributeId, "displayForm");
                const alias = attributeAlias(attribute);
                const localIdentifier = attributeLocalId(attribute);

                if (isUriRef(attributeDisplayFormRef(attribute))) {
                    ref = uriRef(attributeId);
                }
                const existingVirtualBucket = insightBucket(insight, bucketName);
                if (!existingVirtualBucket) {
                    return newBucket(
                        bucketName,
                        newAttribute(ref, (m) =>
                            m.localId(attributeLocalIdentifier ?? localIdentifier).alias(alias),
                        ),
                    );
                }
            }
        }

        return undefined;
    }
}
