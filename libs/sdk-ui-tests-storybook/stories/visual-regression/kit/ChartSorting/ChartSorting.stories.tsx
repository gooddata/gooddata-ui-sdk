// (C) 2022-2026 GoodData Corporation

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
import { type INeobackstopConfig, type IStoryParameters, State } from "../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../themeWrapper.js";

import "./styles.scss";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };

const dropdownSingleAttributeScenario: INeobackstopConfig = {
    default: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
    attributeDropdownOpen: {
        readySelector: { selector: ".screenshot-target", state: State.Attached },
        clickSelectors: [{ selector: ".s-attribute-dropdown-button" }],
    },
};

const dropdownSingleChronologicalDateScenario: INeobackstopConfig = {
    default: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
    attributeDropdownOpen: {
        readySelector: { selector: ".screenshot-target", state: State.Attached },
        clickSelectors: [{ selector: ".s-attribute-dropdown-button" }],
    },
};

const dropdownSingleGenericDateScenario: INeobackstopConfig = {
    default: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
    attributeDropdownOpen: {
        readySelector: { selector: ".screenshot-target", state: State.Attached },
        clickSelectors: [{ selector: ".s-attribute-dropdown-button" }],
    },
    applyButtonActivated: {
        readySelector: { selector: ".screenshot-target", state: State.Attached },
        clickSelectors: [
            { selector: ".s-attribute-dropdown-button" },
            { selector: ".s-smallest_to_largest" },
        ],
    },
};

const dropdownSingleAttributeSingleMetricScenario: INeobackstopConfig = {
    default: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
    attributeDropdownOpen: {
        readySelector: { selector: ".screenshot-target", state: State.Attached },
        clickSelectors: [{ selector: ".s-attribute-dropdown-button" }],
    },
};
const dropdownMultipleAttributesMultipleMetricsScenario: INeobackstopConfig = {
    default: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
    measureDropdownOpen: {
        readySelector: { selector: ".screenshot-target", state: State.Attached },
        clickSelectors: [{ selector: ".s-snapshot__m1_" }],
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
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
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
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
