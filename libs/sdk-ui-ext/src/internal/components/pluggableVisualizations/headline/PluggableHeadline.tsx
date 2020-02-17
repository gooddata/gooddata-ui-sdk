// (C) 2019 GoodData Corporation

import * as React from "react";
import { render } from "react-dom";
import { IntlShape } from "react-intl";

import cloneDeep = require("lodash/cloneDeep");
import get = require("lodash/get");

import { BucketNames, DefaultLocale, ILocale } from "@gooddata/sdk-ui";
import { METRIC } from "../../../constants/bucket";
import { CoreHeadline, updateConfigWithSettings } from "@gooddata/sdk-ui-charts";

import { configurePercent, configureOverTimeComparison } from "../../../utils/bucketConfig";
import UnsupportedConfigurationPanel from "../../configurationPanels/UnsupportedConfigurationPanel";
import {
    IReferencePoint,
    IExtendedReferencePoint,
    IVisCallbacks,
    IVisConstruct,
    IVisProps,
    IVisualizationProperties,
    IBucketItem,
    IBucketOfFun,
    RenderFunction,
} from "../../../interfaces/Visualization";
import {
    sanitizeUnusedFilters,
    removeAllDerivedMeasures,
    removeAllArithmeticMeasuresFromDerived,
    isDerivedBucketItem,
    hasDerivedBucketItems,
    findDerivedBucketItem,
    getAllItemsByType,
    limitNumberOfMeasuresInBuckets,
} from "../../../utils/bucketHelper";
import { removeSort } from "../../../utils/sort";
import {
    getDefaultHeadlineUiConfig,
    getHeadlineUiConfig,
} from "../../../utils/uiConfigHelpers/headlineUiConfigHelper";
import { createInternalIntl } from "../../../utils/internalIntlProvider";
import {
    findComplementaryOverTimeComparisonMeasure,
    findSecondMasterMeasure,
    tryToMapForeignBuckets,
    setHeadlineRefPointBuckets,
} from "./headlineBucketHelper";
import { hasGlobalDateFilter } from "../../../utils/bucketRules";
import { AbstractPluggableVisualization } from "../AbstractPluggableVisualization";
import {
    getReferencePointWithSupportedProperties,
    getSupportedProperties,
} from "../../../utils/propertiesHelper";
import { IInsight, insightProperties, insightHasDataDefined } from "@gooddata/sdk-model";
import { IExecutionFactory, ISettings } from "@gooddata/sdk-backend-spi";
import { unmountComponentsAtNodes } from "../../../utils/domHelper";

export class PluggableHeadline extends AbstractPluggableVisualization {
    protected configPanelElement: string;
    // private projectId: string;
    private callbacks: IVisCallbacks;
    private intl: IntlShape;
    private locale: ILocale;
    private visualizationProperties: IVisualizationProperties;
    private element: string;
    private settings?: ISettings;
    private renderFun: RenderFunction;

    constructor(props: IVisConstruct) {
        super();
        //  this.projectId = props.projectId;
        this.element = props.element;
        this.configPanelElement = props.configPanelElement;
        this.callbacks = props.callbacks;
        this.locale = props.locale ? props.locale : DefaultLocale;
        this.intl = createInternalIntl(this.locale);
        this.settings = props.featureFlags;
        this.renderFun = props.renderFun;
    }

    public unmount() {
        unmountComponentsAtNodes([this.element, this.configPanelElement]);
    }

    public update(options: IVisProps, insight: IInsight, executionFactory: IExecutionFactory) {
        this.visualizationProperties = insightProperties(insight);
        this.renderVisualization(options, insight, executionFactory);
        this.renderConfigurationPanel();
    }

    public getExtendedReferencePoint(referencePoint: Readonly<IReferencePoint>) {
        const referencePointCloned = cloneDeep(referencePoint);
        let newReferencePoint: IExtendedReferencePoint = {
            ...referencePointCloned,
            uiConfig: getDefaultHeadlineUiConfig(),
        };

        if (!hasGlobalDateFilter(referencePoint.filters)) {
            newReferencePoint = removeAllArithmeticMeasuresFromDerived(newReferencePoint);
            newReferencePoint = removeAllDerivedMeasures(newReferencePoint);
        }

        const mappedReferencePoint = tryToMapForeignBuckets(newReferencePoint);

        if (mappedReferencePoint) {
            newReferencePoint = mappedReferencePoint;
        } else {
            const limitedBuckets = limitNumberOfMeasuresInBuckets(newReferencePoint.buckets, 2, true);
            const allMeasures = getAllItemsByType(limitedBuckets, [METRIC]);
            const primaryMeasure = allMeasures.length > 0 ? allMeasures[0] : null;
            const secondaryMeasure =
                findComplementaryOverTimeComparisonMeasure(primaryMeasure, allMeasures) ||
                findSecondMasterMeasure(allMeasures);

            newReferencePoint = setHeadlineRefPointBuckets(
                newReferencePoint,
                primaryMeasure,
                secondaryMeasure,
            );
        }

        configurePercent(newReferencePoint, true);
        configureOverTimeComparison(newReferencePoint);

        newReferencePoint.uiConfig = getHeadlineUiConfig(newReferencePoint, this.intl);
        newReferencePoint = getReferencePointWithSupportedProperties(
            newReferencePoint,
            this.supportedPropertiesList,
        );
        newReferencePoint = removeSort(newReferencePoint);

        return Promise.resolve(sanitizeUnusedFilters(newReferencePoint, referencePoint));
    }

    protected renderVisualization(
        options: IVisProps,
        insight: IInsight,
        executionFactory: IExecutionFactory,
    ) {
        if (!insightHasDataDefined(insight)) {
            return;
        }

        const { locale, custom = {}, config } = options;
        const { drillableItems } = custom;
        const { afterRender, onError, onLoadingChanged, pushData, onDrill } = this.callbacks;
        const execution = executionFactory
            .forInsight(insight)
            .withDimensions({ itemIdentifiers: ["measureGroup"] });

        this.renderFun(
            <CoreHeadline
                execution={execution}
                drillableItems={drillableItems}
                onDrill={onDrill}
                locale={locale}
                config={updateConfigWithSettings(config, this.settings)}
                afterRender={afterRender}
                onLoadingChanged={onLoadingChanged}
                pushData={pushData}
                onError={onError}
                LoadingComponent={null}
                ErrorComponent={null}
            />,
            document.querySelector(this.element),
        );
    }

    protected renderConfigurationPanel() {
        if (document.querySelector(this.configPanelElement)) {
            const properties: IVisualizationProperties = get(
                this.visualizationProperties,
                "properties",
                {},
            ) as IVisualizationProperties;

            render(
                <UnsupportedConfigurationPanel
                    locale={this.locale}
                    pushData={this.callbacks.pushData}
                    properties={getSupportedProperties(properties, this.supportedPropertiesList)}
                />,
                document.querySelector(this.configPanelElement),
            );
        }
    }

    protected mergeDerivedBucketItems(
        referencePoint: IReferencePoint,
        bucket: IBucketOfFun,
        newDerivedBucketItems: IBucketItem[],
    ): IBucketItem[] {
        return bucket.items.reduce((resultItems: IBucketItem[], bucketItem: IBucketItem) => {
            const newDerivedBucketItem = findDerivedBucketItem(bucketItem, newDerivedBucketItems);
            const shouldAddItem =
                newDerivedBucketItem &&
                !isDerivedBucketItem(bucketItem) &&
                !hasDerivedBucketItems(bucketItem, referencePoint.buckets);
            const shouldAddAfterMasterItem = bucket.localIdentifier === BucketNames.MEASURES;

            if (shouldAddItem && !shouldAddAfterMasterItem) {
                resultItems.push(newDerivedBucketItem);
            }

            resultItems.push(bucketItem);

            if (shouldAddItem && shouldAddAfterMasterItem) {
                resultItems.push(newDerivedBucketItem);
            }

            return resultItems;
        }, []);
    }
}
