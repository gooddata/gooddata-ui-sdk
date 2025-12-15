// (C) 2022-2025 GoodData Corporation

import { action } from "storybook/actions";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { attributeLocalId, measureLocalId } from "@gooddata/sdk-model";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/internal";
import { ChartSortingDialog, type IBucketItemDescriptors } from "@gooddata/sdk-ui-kit";

import {
    multipleAttributesMultipleMetricsSortConfig,
    singleAttributeSortConfig,
    singleAttributeWithMultipleMetrics,
    singleAttributeWithSingleMetricSortConfig,
    singleChronologicalDateSortConfig,
    singleGenericDateAndMetricSortConfig,
} from "./ChartSortingMock.js";
import { type INeobackstopConfig, type IStoryParameters } from "../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../themeWrapper.js";

import "./styles.scss";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };

const dropdownSingleAttributeScenario: INeobackstopConfig = {
    default: { readySelector: ".screenshot-target" },
    attributeDropdownOpen: {
        readySelector: ".screenshot-target",
        clickSelectors: [".s-attribute-dropdown-button", 200],
    },
};

const dropdownSingleChronologicalDateScenario: INeobackstopConfig = {
    default: { readySelector: ".screenshot-target" },
    attributeDropdownOpen: {
        readySelector: ".screenshot-target",
        clickSelectors: [".s-attribute-dropdown-button", 200],
    },
};

const dropdownSingleGenericDateScenario: INeobackstopConfig = {
    default: { readySelector: ".screenshot-target" },
    attributeDropdownOpen: {
        readySelector: ".screenshot-target",
        clickSelectors: [".s-attribute-dropdown-button", 200],
    },
    applyButtonActivated: {
        readySelector: ".screenshot-target",
        clickSelectors: [".s-attribute-dropdown-button", 200, ".s-smallest_to_largest", 200],
    },
};

const dropdownSingleAttributeSingleMetricScenario: INeobackstopConfig = {
    default: { readySelector: ".screenshot-target" },
    attributeDropdownOpen: {
        readySelector: ".screenshot-target",
        clickSelectors: [".s-attribute-dropdown-button", 200],
    },
};
const dropdownMultipleAttributesMultipleMetricsScenario: INeobackstopConfig = {
    default: { readySelector: ".screenshot-target" },
    measureDropdownOpen: {
        readySelector: ".screenshot-target",
        clickSelectors: [".s-snapshot__m1_", 200],
    },
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

// eslint-disable-next-line no-restricted-exports
export default {
    title: "12 UI Kit/ChartSorting",
};

export function DropdownSingleAttribute() {
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
                />
            </InternalIntlWrapper>
        </div>
    );
}
DropdownSingleAttribute.parameters = {
    kind: "dropdown single attribute",
    screenshots: dropdownSingleAttributeScenario,
} satisfies IStoryParameters;

export function DropdownSingleChronologicalDate() {
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
                />
            </InternalIntlWrapper>
        </div>
    );
}
DropdownSingleChronologicalDate.parameters = {
    kind: "dropdown single chronological date",
    screenshots: dropdownSingleChronologicalDateScenario,
} satisfies IStoryParameters;

export function DropdownSingleGenericDateAndMeasure() {
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
}
DropdownSingleGenericDateAndMeasure.parameters = {
    kind: "dropdown single generic date and measure",
    screenshots: dropdownSingleGenericDateScenario,
} satisfies IStoryParameters;

export function DropdownSingleAttributeSingleMetric() {
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
                />
            </InternalIntlWrapper>
        </div>
    );
}
DropdownSingleAttributeSingleMetric.parameters = {
    kind: "dropdown single attribute single metric",
    screenshots: dropdownSingleAttributeSingleMetricScenario,
} satisfies IStoryParameters;

export function DropdownSingleAttributeMultipleMetrics() {
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
                />
            </InternalIntlWrapper>
        </div>
    );
}
DropdownSingleAttributeMultipleMetrics.parameters = {
    kind: "dropdown single attribute multiple metrics",
    screenshot: { readySelector: ".screenshot-target" },
} satisfies IStoryParameters;

export function DropdownMultipleAttributesMultipleMetrics() {
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
                />
            </InternalIntlWrapper>
        </div>
    );
}
DropdownMultipleAttributesMultipleMetrics.parameters = {
    kind: "dropdown multiple attributes multiple metrics",
    screenshots: dropdownMultipleAttributesMultipleMetricsScenario,
} satisfies IStoryParameters;

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
                />
            </InternalIntlWrapper>
        </div>,
    );
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: ".screenshot-target" },
} satisfies IStoryParameters;
