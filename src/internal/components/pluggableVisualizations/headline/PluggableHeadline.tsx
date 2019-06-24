// (C) 2019 GoodData Corporation
import * as React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { InjectedIntl } from "react-intl";
import { AFM, VisualizationObject } from "@gooddata/typings";

import cloneDeep = require("lodash/cloneDeep");
import get = require("lodash/get");

import * as BucketNames from "../../../../constants/bucketNames";
import { METRIC } from "../../../constants/bucket";

import { configurePercent, configureOverTimeComparison } from "../../../utils/bucketConfig";
import UnsupportedConfigurationPanel from "../../configurationPanels/UnsupportedConfigurationPanel";
import {
    IReferencePoint,
    IExtendedReferencePoint,
    IVisCallbacks,
    IVisConstruct,
    IVisProps,
    ILocale,
    IVisualizationProperties,
    IBucketItem,
    IBucket,
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
import { Headline } from "../../../../components/core/Headline";
import { VisualizationTypes } from "../../../../constants/visualizationTypes";
import { generateDimensions } from "../../../../helpers/dimensions";
import { DEFAULT_LOCALE } from "../../../../constants/localization";

export class PluggableHeadline extends AbstractPluggableVisualization {
    protected configPanelElement: string;
    private projectId: string;
    private callbacks: IVisCallbacks;
    private intl: InjectedIntl;
    private locale: ILocale;
    private visualizationProperties: IVisualizationProperties;
    private element: string;

    constructor(props: IVisConstruct) {
        super();
        this.projectId = props.projectId;
        this.element = props.element;
        this.configPanelElement = props.configPanelElement;
        this.callbacks = props.callbacks;
        this.locale = props.locale ? props.locale : DEFAULT_LOCALE;
        this.intl = createInternalIntl(this.locale);
    }

    public unmount() {
        unmountComponentAtNode(document.querySelector(this.element));
        if (document.querySelector(this.configPanelElement)) {
            unmountComponentAtNode(document.querySelector(this.configPanelElement));
        }
    }

    public update(
        options: IVisProps,
        visualizationProperties: IVisualizationProperties,
        mdObject: VisualizationObject.IVisualizationObjectContent,
    ) {
        this.visualizationProperties = visualizationProperties;
        this.renderVisualization(options, mdObject);
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
        mdObject: VisualizationObject.IVisualizationObjectContent,
    ) {
        const { dataSource } = options;

        if (dataSource) {
            const { resultSpec, locale, custom, config } = options;
            const { drillableItems } = custom;
            const { afterRender, onError, onLoadingChanged, pushData } = this.callbacks;

            const resultSpecWithDimensions: AFM.IResultSpec = {
                ...resultSpec,
                dimensions: this.getDimensions(mdObject),
            };

            render(
                <Headline
                    projectId={this.projectId}
                    drillableItems={drillableItems}
                    locale={locale}
                    config={config}
                    dataSource={dataSource}
                    resultSpec={resultSpecWithDimensions}
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

    protected getDimensions(mdObject: VisualizationObject.IVisualizationObjectContent): AFM.IDimension[] {
        return generateDimensions(mdObject, VisualizationTypes.HEADLINE);
    }

    protected mergeDerivedBucketItems(
        referencePoint: IReferencePoint,
        bucket: IBucket,
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
