// (C) 2022 GoodData Corporation
import React from "react";
import { storiesOf } from "../../../_infra/storyRepository.js";
import { action } from "@storybook/addon-actions";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/internal";
import { ChartSortingDialog, IBucketItemDescriptors } from "@gooddata/sdk-ui-kit";
import { measureLocalId, attributeLocalId } from "@gooddata/sdk-model";
import { ExperimentalMd } from "@gooddata/experimental-workspace";

import { UiKit } from "../../../_infra/storyGroups.js";
import { wrapWithTheme } from "../../themeWrapper.js";
import { BackstopConfig } from "../../../_infra/backstopScenario.js";

import {
    singleAttributeSortConfig,
    singleAttributeWithSingleMetricSortConfig,
    singleAttributeWithMultipleMetrics,
    multipleAttributesMultipleMetricsSortConfig,
    singleGenericDateAndMetricSortConfig,
    singleChronologicalDateSortConfig,
} from "./ChartSortingMock.js";

import "./styles.scss";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };

const dropdownSingleAttributeScenario: BackstopConfig = {
    default: {},
    attributeDropdownOpen: { clickSelectors: [".s-attribute-dropdown-button", 200] },
};

const dropdownSingleChronologicalDateScenario: BackstopConfig = {
    default: {},
    attributeDropdownOpen: { clickSelectors: [".s-attribute-dropdown-button", 200] },
};

const dropdownSingleGenericDateScenario: BackstopConfig = {
    default: {},
    attributeDropdownOpen: { clickSelectors: [".s-attribute-dropdown-button", 200] },
    applyButtonActivated: {
        clickSelectors: [".s-attribute-dropdown-button", 200, ".s-smallest_to_largest", 200],
    },
};

const dropdownSingleAttributeSingleMetricScenario: BackstopConfig = {
    default: {},
    attributeDropdownOpen: { clickSelectors: [".s-attribute-dropdown-button", 200] },
};
const dropdownMultipleAttributesMultipleMetricsScenario: BackstopConfig = {
    default: {},
    measureDropdownOpen: { clickSelectors: [".s-snapshot__m1_", 200] },
};

const bucketItemNames: IBucketItemDescriptors = {
    [measureLocalId(ExperimentalMd.SnapshotEOP)]: {
        type: "measure",
        name: "Snapshot",
        sequenceNumber: "M1",
    },
    [measureLocalId(ExperimentalMd.TimelineEOP)]: {
        type: "measure",
        name: "Timeline",
        sequenceNumber: "M2",
    },
    [measureLocalId(ExperimentalMd.NrOfOpportunities)]: {
        type: "measure",
        name: "NrOfOppor.",
        sequenceNumber: "M3",
    },
    [attributeLocalId(ExperimentalMd.Account.Name)]: {
        type: "attribute",
        name: "Account",
    },
    [attributeLocalId(ExperimentalMd.Activity.Subject)]: {
        type: "attribute",
        name: "Activity",
    },
    [attributeLocalId(ExperimentalMd.DateDatasets.Closed.Year.Default)]: {
        type: "chronologicalDate",
        name: "Closed/Year",
    },
    [attributeLocalId(ExperimentalMd.DateDatasets.Closed.MonthYear.Long)]: {
        type: "genericDate",
        name: "Closed/Month of Year",
    },
};

storiesOf(`${UiKit}/ChartSorting`)
    .add(
        "dropdown single attribute",
        () => {
            return (
                <div style={wrapperStyle} className="screenshot-target">
                    <InternalIntlWrapper>
                        <ChartSortingDialog
                            buttonNode="screenshot-target"
                            bucketItems={bucketItemNames}
                            currentSort={singleAttributeSortConfig.currentSort}
                            availableSorts={singleAttributeSortConfig.availableSorts}
                            onApply={action("apply")}
                            onCancel={action("cancel")}
                            enableRenamingMeasureToMetric={true}
                        />
                    </InternalIntlWrapper>
                </div>
            );
        },
        { screenshots: dropdownSingleAttributeScenario },
    )
    .add(
        "dropdown single chronological date",
        () => {
            return (
                <div style={wrapperStyle} className="screenshot-target">
                    <InternalIntlWrapper>
                        <ChartSortingDialog
                            buttonNode="screenshot-target"
                            bucketItems={bucketItemNames}
                            currentSort={singleChronologicalDateSortConfig.currentSort}
                            availableSorts={singleChronologicalDateSortConfig.availableSorts}
                            onApply={action("apply")}
                            onCancel={action("cancel")}
                            enableRenamingMeasureToMetric={true}
                        />
                    </InternalIntlWrapper>
                </div>
            );
        },
        { screenshots: dropdownSingleChronologicalDateScenario },
    )
    .add(
        "dropdown single generic date and measure",
        () => {
            return (
                <div style={wrapperStyle} className="screenshot-target">
                    <InternalIntlWrapper>
                        <ChartSortingDialog
                            buttonNode="screenshot-target"
                            bucketItems={bucketItemNames}
                            currentSort={singleGenericDateAndMetricSortConfig.currentSort}
                            availableSorts={singleGenericDateAndMetricSortConfig.availableSorts}
                            onApply={action("apply")}
                            onCancel={action("cancel")}
                        />
                    </InternalIntlWrapper>
                </div>
            );
        },
        { screenshots: dropdownSingleGenericDateScenario },
    )
    .add(
        "dropdown single attribute single metric",
        () => {
            return (
                <div style={wrapperStyle} className="screenshot-target">
                    <InternalIntlWrapper>
                        <ChartSortingDialog
                            buttonNode="screenshot-target"
                            bucketItems={bucketItemNames}
                            currentSort={singleAttributeWithSingleMetricSortConfig.currentSort}
                            availableSorts={singleAttributeWithSingleMetricSortConfig.availableSorts}
                            onApply={action("apply")}
                            onCancel={action("cancel")}
                            enableRenamingMeasureToMetric={true}
                        />
                    </InternalIntlWrapper>
                </div>
            );
        },
        { screenshots: dropdownSingleAttributeSingleMetricScenario },
    )
    .add(
        "dropdown single attribute multiple metrics",
        () => {
            return (
                <div style={wrapperStyle} className="screenshot-target">
                    <InternalIntlWrapper>
                        <ChartSortingDialog
                            buttonNode="screenshot-target"
                            bucketItems={bucketItemNames}
                            currentSort={singleAttributeWithMultipleMetrics.currentSort}
                            availableSorts={singleAttributeWithMultipleMetrics.availableSorts}
                            onApply={action("apply")}
                            onCancel={action("cancel")}
                            enableRenamingMeasureToMetric={true}
                        />
                    </InternalIntlWrapper>
                </div>
            );
        },
        { screenshot: true },
    )
    .add(
        "dropdown multiple attributes multiple metrics",
        () => {
            return (
                <div style={wrapperStyle} className="screenshot-target">
                    <InternalIntlWrapper>
                        <ChartSortingDialog
                            buttonNode="screenshot-target"
                            bucketItems={bucketItemNames}
                            currentSort={multipleAttributesMultipleMetricsSortConfig.currentSort}
                            availableSorts={multipleAttributesMultipleMetricsSortConfig.availableSorts}
                            onApply={action("apply")}
                            onCancel={action("cancel")}
                            enableRenamingMeasureToMetric={true}
                        />
                    </InternalIntlWrapper>
                </div>
            );
        },
        { screenshots: dropdownMultipleAttributesMultipleMetricsScenario },
    )
    .add(
        "dropdown multiple attributes multiple measures",
        () => {
            return (
                <div style={wrapperStyle} className="screenshot-target">
                    <InternalIntlWrapper>
                        <ChartSortingDialog
                            buttonNode="screenshot-target"
                            bucketItems={bucketItemNames}
                            currentSort={multipleAttributesMultipleMetricsSortConfig.currentSort}
                            availableSorts={multipleAttributesMultipleMetricsSortConfig.availableSorts}
                            onApply={action("apply")}
                            onCancel={action("cancel")}
                            enableRenamingMeasureToMetric={false}
                        />
                    </InternalIntlWrapper>
                </div>
            );
        },
        { screenshots: dropdownMultipleAttributesMultipleMetricsScenario },
    )
    .add(
        "themed",
        () => {
            return wrapWithTheme(
                <div style={wrapperStyle} className="screenshot-target">
                    <InternalIntlWrapper>
                        <ChartSortingDialog
                            buttonNode="screenshot-target"
                            bucketItems={bucketItemNames}
                            currentSort={multipleAttributesMultipleMetricsSortConfig.currentSort}
                            availableSorts={multipleAttributesMultipleMetricsSortConfig.availableSorts}
                            onApply={action("apply")}
                            onCancel={action("cancel")}
                            enableRenamingMeasureToMetric={true}
                        />
                    </InternalIntlWrapper>
                </div>,
            );
        },
        { screenshot: true },
    );
