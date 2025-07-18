// (C) 2022-2025 GoodData Corporation

import { action } from "storybook/actions";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/internal";
import { ChartSortingDialog, IBucketItemDescriptors } from "@gooddata/sdk-ui-kit";
import { measureLocalId, attributeLocalId } from "@gooddata/sdk-model";
import { ReferenceMd } from "@gooddata/reference-workspace";

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
    [measureLocalId(ReferenceMd.SnapshotEOP)]: {
        type: "measure",
        name: "Snapshot",
        sequenceNumber: "M1",
    },
    [measureLocalId(ReferenceMd.TimelineEOP)]: {
        type: "measure",
        name: "Timeline",
        sequenceNumber: "M2",
    },
    [measureLocalId(ReferenceMd.NrOfOpportunities)]: {
        type: "measure",
        name: "NrOfOppor.",
        sequenceNumber: "M3",
    },
    [attributeLocalId(ReferenceMd.Account.Name)]: {
        type: "attribute",
        name: "Account",
    },
    [attributeLocalId(ReferenceMd.Activity.Subject)]: {
        type: "attribute",
        name: "Activity",
    },
    [attributeLocalId(ReferenceMd.DateDatasets.Closed.ClosedYear.Default)]: {
        type: "chronologicalDate",
        name: "Closed/Year",
    },
    [attributeLocalId(ReferenceMd.DateDatasets.Closed.ClosedMonthYear.Default)]: {
        type: "genericDate",
        name: "Closed/Month of Year",
    },
};

export default {
    title: "12 UI Kit/ChartSorting",
};

export const DropdownSingleAttribute = () => (
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
DropdownSingleAttribute.parameters = {
    kind: "dropdown single attribute",
    screenshots: dropdownSingleAttributeScenario,
};

export const DropdownSingleChronologicalDate = () => (
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
DropdownSingleChronologicalDate.parameters = {
    kind: "dropdown single chronological date",
    screenshots: dropdownSingleChronologicalDateScenario,
};

export const DropdownSingleGenericDateAndMeasure = () => (
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
DropdownSingleGenericDateAndMeasure.parameters = {
    kind: "dropdown single generic date and measure",
    screenshots: dropdownSingleGenericDateScenario,
};

export const DropdownSingleAttributeSingleMetric = () => (
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
DropdownSingleAttributeSingleMetric.parameters = {
    kind: "dropdown single attribute single metric",
    screenshots: dropdownSingleAttributeSingleMetricScenario,
};

export const DropdownSingleAttributeMultipleMetrics = () => (
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
DropdownSingleAttributeMultipleMetrics.parameters = {
    kind: "dropdown single attribute multiple metrics",
    screenshot: true,
};

export const DropdownMultipleAttributesMultipleMetrics = () => (
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
DropdownMultipleAttributesMultipleMetrics.parameters = {
    kind: "dropdown multiple attributes multiple metrics",
    screenshots: dropdownMultipleAttributesMultipleMetricsScenario,
};

export const DropdownMultipleAttributesMultipleMeasures = () => (
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
DropdownMultipleAttributesMultipleMeasures.parameters = {
    kind: "dropdown multiple attributes multiple measures",
    screenshots: dropdownMultipleAttributesMultipleMetricsScenario,
};

export const Themed = () =>
    wrapWithTheme(
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
Themed.parameters = {
    kind: "themed",
    screenshot: true,
};
