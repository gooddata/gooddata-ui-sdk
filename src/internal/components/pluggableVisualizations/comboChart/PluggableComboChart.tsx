// (C) 2019 GoodData Corporation
import cloneDeep = require("lodash/cloneDeep");
import get = require("lodash/get");
import set = require("lodash/set");
import without = require("lodash/without");
import * as BucketNames from "../../../../constants/bucketNames";
import { configurePercent, configureOverTimeComparison } from "../../../utils/bucketConfig";
import { PluggableBaseChart } from "../baseChart/PluggableBaseChart";
import {
    IReferencePoint,
    IExtendedReferencePoint,
    IVisConstruct,
    IBucketItem,
    IBucket,
    IVisualizationProperties,
    IUiConfig,
} from "../../../interfaces/Visualization";

import { METRIC, BUCKETS } from "../../../constants/bucket";

import {
    sanitizeUnusedFilters,
    getBucketItemsByType,
    getAllAttributeItemsWithPreference,
    getBucketItemsWithExcludeByType,
    applyUiConfig,
    hasBucket,
    findBucket,
    getAllMeasuresShowOnSecondaryAxis,
    getMeasureItems,
    setMeasuresShowOnSecondaryAxis,
} from "../../../utils/bucketHelper";

import { setComboChartUiConfig } from "../../../utils/uiConfigHelpers/comboChartUiConfigHelper";
import { removeSort } from "../../../utils/sort";
import { AXIS, AXIS_NAME } from "../../../constants/axis";
import {
    COMBO_CHART_SUPPORTED_PROPERTIES,
    OPTIONAL_STACKING_PROPERTIES,
} from "../../../constants/supportedProperties";
import {
    COMBO_CHART_UICONFIG,
    UICONFIG_AXIS,
    COMBO_CHART_UICONFIG_WITH_OPTIONAL_STACKING,
} from "../../../constants/uiConfig";
import {
    getReferencePointWithSupportedProperties,
    setSecondaryMeasures,
    isDualAxisOrSomeSecondaryAxisMeasure,
} from "../../../utils/propertiesHelper";
import {
    PROPERTY_CONTROLS,
    PROPERTY_CONTROLS_DUAL_AXIS,
    PROPERTY_CONTROLS_PRIMARY_CHART_TYPE,
    PROPERTY_CONTROLS_SECONDARY_CHART_TYPE,
} from "../../../constants/properties";
import { VisualizationTypes } from "../../../../constants/visualizationTypes";

export class PluggableComboChart extends PluggableBaseChart {
    private primaryChartType: string = VisualizationTypes.COLUMN;

    constructor(props: IVisConstruct) {
        super(props);
        this.type = VisualizationTypes.COMBO;
        this.axis = AXIS.DUAL;
        this.secondaryAxis = AXIS_NAME.SECONDARY_Y;
        this.primaryChartType = get(
            props.visualizationProperties,
            PROPERTY_CONTROLS_PRIMARY_CHART_TYPE,
            VisualizationTypes.COLUMN,
        );
        this.supportedPropertiesList = this.getSupportedPropertiesList();
        this.defaultControlsProperties = this.isOptionalStackingEnabled()
            ? {
                  stackMeasures: this.isStackMeasuresByDefault(),
              }
            : {};
        this.initializeProperties(props.visualizationProperties);
    }

    public isOptionalStackingEnabled() {
        return super.isOptionalStackingEnabled() && this.primaryChartType !== VisualizationTypes.LINE;
    }

    public getSupportedPropertiesList() {
        const supportedPropertiesList = COMBO_CHART_SUPPORTED_PROPERTIES[this.axis] || [];
        return this.isOptionalStackingEnabled()
            ? [...supportedPropertiesList, ...OPTIONAL_STACKING_PROPERTIES]
            : supportedPropertiesList;
    }

    public getUiConfig(): IUiConfig {
        if (this.isOptionalStackingEnabled()) {
            return cloneDeep({
                ...COMBO_CHART_UICONFIG_WITH_OPTIONAL_STACKING,
                optionalStacking: {
                    supported: true,
                    stackMeasures: this.isStackMeasuresByDefault(),
                },
            });
        }

        return cloneDeep(COMBO_CHART_UICONFIG);
    }

    public getExtendedReferencePoint(referencePoint: IReferencePoint): Promise<IExtendedReferencePoint> {
        const clonedReferencePoint = cloneDeep(referencePoint);
        const properties = this.configureChartTypes(clonedReferencePoint);
        this.primaryChartType = get(properties, "controls.primaryChartType", VisualizationTypes.COLUMN);

        let newReferencePoint: IExtendedReferencePoint = {
            ...clonedReferencePoint,
            properties,
            uiConfig: this.getUiConfig(),
        };

        this.defaultControlsProperties = this.isOptionalStackingEnabled()
            ? {
                  stackMeasures: this.isStackMeasuresByDefault(),
              }
            : {};

        this.configureBuckets(newReferencePoint);
        newReferencePoint = setSecondaryMeasures(newReferencePoint, this.secondaryAxis);

        this.axis = get(newReferencePoint, UICONFIG_AXIS, AXIS.PRIMARY);

        this.supportedPropertiesList = this.getSupportedPropertiesList();

        newReferencePoint = setComboChartUiConfig(newReferencePoint, this.intl, this.type);
        newReferencePoint = configurePercent(newReferencePoint, this.axis !== AXIS.DUAL);
        newReferencePoint = configureOverTimeComparison(newReferencePoint);
        newReferencePoint = getReferencePointWithSupportedProperties(
            newReferencePoint,
            this.supportedPropertiesList,
        );
        newReferencePoint = applyUiConfig(newReferencePoint);
        newReferencePoint = removeSort(newReferencePoint);

        return Promise.resolve(sanitizeUnusedFilters(newReferencePoint, referencePoint));
    }

    public isStackMeasuresByDefault() {
        return this.primaryChartType === VisualizationTypes.AREA;
    }

    protected configureBuckets(extReferencePoint: IExtendedReferencePoint): void {
        const buckets: IBucket[] = get(extReferencePoint, BUCKETS, []);
        const attributes: IBucketItem[] = getAllAttributeItemsWithPreference(buckets, [
            BucketNames.TREND,
            BucketNames.VIEW,
        ]).slice(0, 1);

        let measures: IBucketItem[] = [];
        let secondaryMeasures: IBucketItem[] = [];

        // ref. point has both my buckets -> reuse them fully
        if (hasBucket(buckets, BucketNames.MEASURES) && hasBucket(buckets, BucketNames.SECONDARY_MEASURES)) {
            measures = getBucketItemsByType(buckets, BucketNames.MEASURES, [METRIC]);
            secondaryMeasures = getBucketItemsByType(buckets, BucketNames.SECONDARY_MEASURES, [METRIC]);

            const restMeasures = getBucketItemsWithExcludeByType(
                buckets,
                [BucketNames.MEASURES, BucketNames.SECONDARY_MEASURES],
                [METRIC],
            );
            secondaryMeasures = secondaryMeasures.concat(restMeasures);
        } else {
            // transform from dual axis chart to combo chart
            const allMeasures = getMeasureItems(buckets);
            secondaryMeasures = getAllMeasuresShowOnSecondaryAxis(buckets);
            measures = without(allMeasures, ...secondaryMeasures);
        }

        const isDualAxisEnabled = isDualAxisOrSomeSecondaryAxisMeasure(extReferencePoint, secondaryMeasures);

        set(extReferencePoint, PROPERTY_CONTROLS_DUAL_AXIS, isDualAxisEnabled);

        const primaryChartType = get(
            extReferencePoint,
            PROPERTY_CONTROLS_PRIMARY_CHART_TYPE,
            VisualizationTypes.COLUMN,
        );
        const secondaryChartType = get(
            extReferencePoint,
            PROPERTY_CONTROLS_SECONDARY_CHART_TYPE,
            VisualizationTypes.LINE,
        );

        set(extReferencePoint, BUCKETS, [
            {
                localIdentifier: BucketNames.MEASURES,
                items: setMeasuresShowOnSecondaryAxis(measures, false),
                chartType: primaryChartType,
            },
            {
                localIdentifier: BucketNames.SECONDARY_MEASURES,
                items: setMeasuresShowOnSecondaryAxis(secondaryMeasures, isDualAxisEnabled),
                chartType: secondaryChartType,
            },
            {
                localIdentifier: BucketNames.VIEW,
                items: attributes,
            },
        ]);
    }

    private configureChartTypes(referencePoint: IReferencePoint): IVisualizationProperties {
        const buckets: IBucket[] = get(referencePoint, BUCKETS, []);
        const primaryChartType = get(findBucket(buckets, BucketNames.MEASURES), "chartType");
        const secondaryChartType = get(findBucket(buckets, BucketNames.SECONDARY_MEASURES), "chartType");

        if (primaryChartType || secondaryChartType) {
            return {
                ...referencePoint.properties,
                controls: {
                    ...get(referencePoint, PROPERTY_CONTROLS, {}),
                    primaryChartType,
                    secondaryChartType,
                },
            };
        }

        return referencePoint.properties;
    }
}
