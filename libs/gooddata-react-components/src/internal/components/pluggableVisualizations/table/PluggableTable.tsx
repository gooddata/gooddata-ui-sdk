// (C) 2019 GoodData Corporation
import cloneDeep = require("lodash/cloneDeep");
import set = require("lodash/set");
import uniqBy = require("lodash/uniqBy");
import get = require("lodash/get");
import isEmpty = require("lodash/isEmpty");
import isNil = require("lodash/isNil");

import * as React from "react";
import Measure from "react-measure";
import { render, unmountComponentAtNode } from "react-dom";
import { InjectedIntl } from "react-intl";
import { AFM, VisualizationObject } from "@gooddata/typings";
import { configurePercent, configureOverTimeComparison } from "../../../utils/bucketConfig";
import UnsupportedConfigurationPanel from "../../configurationPanels/UnsupportedConfigurationPanel";

import * as BucketNames from "../../../../constants/bucketNames";
import * as VisEvents from "../../../../interfaces/Events";
import {
    IReferencePoint,
    IExtendedReferencePoint,
    IVisCallbacks,
    IVisConstruct,
    IVisProps,
    ILocale,
    IVisualizationProperties,
} from "../../../interfaces/Visualization";

import { ATTRIBUTE, DATE, METRIC, BUCKETS } from "../../../constants/bucket";

import { sanitizeUnusedFilters, getAllItemsByType, getTotalsFromBucket } from "../../../utils/bucketHelper";

import { createSorts, setSortItems, removeInvalidSort } from "../../../utils/sort";

import { setTableUiConfig } from "../../../utils/uiConfigHelpers/tableUiConfigHelper";
import { createInternalIntl } from "../../../utils/internalIntlProvider";
import { expandTotalsInResultSpec } from "../../../utils/executionObjectHelper";
import { DEFAULT_TABLE_UICONFIG } from "../../../constants/uiConfig";
import { AbstractPluggableVisualization } from "../AbstractPluggableVisualization";
import { getReferencePointWithSupportedProperties } from "../../../utils/propertiesHelper";
import { VisualizationEnvironment } from "../../../../components/uri/Visualization";
import { VisualizationTypes } from "../../../../constants/visualizationTypes";
import { Table } from "../../../../components/core/Table";
import { generateDimensions } from "../../../../helpers/dimensions";
import { DEFAULT_LOCALE } from "../../../../constants/localization";

// removes sorts with other than specified number of locators (counts both measure and attribute locators)
export const removeSortsWithInvalidLocatorCount = (
    referencePoint: IReferencePoint,
    correctLocatorCount: number = 1,
) => {
    const originalSortItems = get(referencePoint.properties, ["sortItems"], []);

    const filteredSortItems = originalSortItems.filter((sortItem: AFM.SortItem) => {
        // Filter out measureSortItems with locator count other than correctLocatorCount
        return (
            AFM.isAttributeSortItem(sortItem) ||
            (AFM.isMeasureSortItem(sortItem) &&
                sortItem.measureSortItem.locators.length === correctLocatorCount)
        );
    });

    if (filteredSortItems.length < originalSortItems.length) {
        set(referencePoint, ["properties", "sortItems"], filteredSortItems);
    }
};

export class PluggableTable extends AbstractPluggableVisualization {
    private projectId: string;
    private element: string;
    private configPanelElement: string;
    private callbacks: IVisCallbacks;
    private environment: VisualizationEnvironment;
    private visualizationProperties: IVisualizationProperties;
    private intl: InjectedIntl;
    private locale: ILocale;

    constructor(props: IVisConstruct) {
        super();
        this.projectId = props.projectId;
        this.element = props.element;
        this.configPanelElement = props.configPanelElement;
        this.environment = props.environment;
        this.callbacks = props.callbacks;
        this.locale = props.locale ? props.locale : DEFAULT_LOCALE;
        this.intl = createInternalIntl(this.locale);
        this.onExportReady = props.callbacks.onExportReady && this.onExportReady.bind(this);
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
        this.renderVisualization(options, visualizationProperties, mdObject);
        this.renderConfigurationPanel();
    }

    public getExtendedReferencePoint(referencePoint: IReferencePoint): Promise<IExtendedReferencePoint> {
        const clonedReferencePoint = cloneDeep(referencePoint);
        let newReferencePoint: IExtendedReferencePoint = {
            ...clonedReferencePoint,
            uiConfig: cloneDeep(DEFAULT_TABLE_UICONFIG),
        };

        const attributes = getAllItemsByType(clonedReferencePoint.buckets, [ATTRIBUTE, DATE]);
        const measures = getAllItemsByType(clonedReferencePoint.buckets, [METRIC]);

        const totals = getTotalsFromBucket(clonedReferencePoint.buckets, BucketNames.ATTRIBUTE);
        const totalsProp = !isEmpty(totals) ? { totals } : {};

        const uniqueAttributes = uniqBy(attributes, attribute => get(attribute, "attribute"));

        const newBuckets = [
            {
                localIdentifier: BucketNames.MEASURES,
                items: measures,
            },
            {
                localIdentifier: BucketNames.ATTRIBUTE,
                items: uniqueAttributes,
                ...totalsProp,
            },
        ];

        set(newReferencePoint, BUCKETS, newBuckets);

        newReferencePoint = removeInvalidSort(newReferencePoint);
        removeSortsWithInvalidLocatorCount(newReferencePoint, 1);

        const referencePointWithSorts = setSortItems(newReferencePoint);
        let referencePointWithUiConfig = setTableUiConfig(
            referencePointWithSorts,
            this.intl,
            VisualizationTypes.TABLE,
        );
        referencePointWithUiConfig = configurePercent(referencePointWithUiConfig, false);
        referencePointWithUiConfig = configureOverTimeComparison(referencePointWithUiConfig);
        referencePointWithUiConfig = getReferencePointWithSupportedProperties(
            referencePointWithUiConfig,
            this.supportedPropertiesList,
        );

        return Promise.resolve(sanitizeUnusedFilters(referencePointWithUiConfig, clonedReferencePoint));
    }

    protected renderVisualization(
        options: IVisProps,
        visualizationProperties: IVisualizationProperties,
        mdObject: VisualizationObject.IVisualizationObjectContent,
    ) {
        const { dataSource } = options;

        if (dataSource) {
            const { resultSpec, locale, custom, dimensions, config } = options;
            const { height } = dimensions;
            const { stickyHeaderOffset, drillableItems, totalsEditAllowed } = custom;
            const { afterRender, onError, onLoadingChanged, pushData } = this.callbacks;

            const resultSpecWithDimensions: AFM.IResultSpec = {
                ...resultSpec,
                dimensions: this.getDimensions(mdObject),
            };

            const sorts: AFM.SortItem[] = createSorts(
                VisualizationTypes.TABLE,
                dataSource.getAfm(),
                resultSpecWithDimensions,
                visualizationProperties,
            );

            const resultSpecWithSorts = resultSpecWithDimensions.sorts
                ? resultSpecWithDimensions
                : {
                      ...resultSpecWithDimensions,
                      sorts,
                  };

            const resultSpecWithTotals = totalsEditAllowed
                ? expandTotalsInResultSpec(dataSource.getAfm(), resultSpecWithSorts)
                : resultSpecWithSorts;

            const attributeBucket = mdObject.buckets.find(
                bucket => bucket.localIdentifier === BucketNames.ATTRIBUTE,
            );
            const totals = get(attributeBucket, "totals", []);

            if (isNil(height)) {
                render(
                    <Measure client={true}>
                        {({ measureRef, contentRect }: any) => {
                            const usedHeight = Math.floor(contentRect.client.height);
                            return (
                                <div className="table-resizer" ref={measureRef}>
                                    <Table
                                        projectId={this.projectId}
                                        environment={this.environment}
                                        drillableItems={drillableItems}
                                        config={config}
                                        totals={totals}
                                        totalsEditAllowed={totalsEditAllowed}
                                        stickyHeaderOffset={stickyHeaderOffset}
                                        height={usedHeight}
                                        locale={locale}
                                        dataSource={dataSource}
                                        resultSpec={resultSpecWithTotals}
                                        afterRender={afterRender}
                                        onLoadingChanged={onLoadingChanged}
                                        pushData={pushData}
                                        onError={onError}
                                        onExportReady={this.onExportReady}
                                        LoadingComponent={null}
                                        ErrorComponent={null}
                                    />
                                </div>
                            );
                        }}
                    </Measure>,
                    document.querySelector(this.element),
                );

                return;
            }

            render(
                <Table
                    projectId={this.projectId}
                    environment={this.environment}
                    drillableItems={drillableItems}
                    config={config}
                    totals={totals}
                    totalsEditAllowed={totalsEditAllowed}
                    stickyHeaderOffset={stickyHeaderOffset}
                    locale={locale}
                    dataSource={dataSource}
                    resultSpec={resultSpecWithTotals}
                    afterRender={afterRender}
                    onLoadingChanged={onLoadingChanged}
                    pushData={pushData}
                    onError={onError}
                    onExportReady={this.onExportReady}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />,
                document.querySelector(this.element),
            );
        }
    }

    protected onExportReady(exportResult: VisEvents.IExportFunction) {
        const { onExportReady } = this.callbacks;
        if (onExportReady) {
            onExportReady(exportResult);
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
                    properties={properties}
                />,
                document.querySelector(this.configPanelElement),
            );
        }
    }

    protected getDimensions(mdObject: VisualizationObject.IVisualizationObjectContent): AFM.IDimension[] {
        return generateDimensions(mdObject, VisualizationTypes.TABLE);
    }
}
