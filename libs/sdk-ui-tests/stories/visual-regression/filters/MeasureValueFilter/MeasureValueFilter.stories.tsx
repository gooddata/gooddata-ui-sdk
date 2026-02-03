// (C) 2007-2026 GoodData Corporation

import { action } from "storybook/actions";

import { type IMeasureValueFilter, localIdRef, newMeasureValueFilterWithOptions } from "@gooddata/sdk-model";
import { MeasureValueFilterDropdown } from "@gooddata/sdk-ui-filters";

import "@gooddata/sdk-ui-filters/styles/css/measureValueFilter.css";
import { type INeobackstopConfig, type IStoryParameters, State } from "../../../_infra/backstopScenario.js";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };

const scenarios: INeobackstopConfig = {
    closed: {
        readySelector: { selector: ".screenshot-target", state: State.Attached },
        misMatchThreshold: 0.01,
    },
    opened: {
        readySelector: { selector: ".s-mvf-operator-dropdown-button", state: State.Attached },
        clickSelector: ".s-mvf-operator-dropdown-button",
        delay: {
            postOperation: 200,
        },
        misMatchThreshold: 0.01,
    },
    "between-selected": {
        readySelector: { selector: ".s-mvf-operator-dropdown-button", state: State.Attached },
        clickSelectors: [
            { selector: ".s-mvf-operator-dropdown-button" },
            { selector: ".s-mvf-operator-between" },
        ],
        delay: {
            postOperation: 200,
        },
        misMatchThreshold: 0.01,
    },
    "greater-than-selected": {
        readySelector: { selector: ".s-mvf-operator-dropdown-button", state: State.Attached },
        clickSelectors: [
            { selector: ".s-mvf-operator-dropdown-button" },
            { selector: ".s-mvf-operator-greater_than" },
        ],
        delay: {
            postOperation: 200,
        },
        misMatchThreshold: 0.01,
    },
};

// we do not have a proper factory function for ALL MVF, nor do we really need one
// this to satisfy sdk-ui-tests tsconfig that is stricter than that of sdk-ui-filters
const filter: IMeasureValueFilter = {
    measureValueFilter: {
        measure: localIdRef("localIdentifier"),
    },
};

// Filter with multiple conditions (two BETWEEN conditions) and dimensionality enabled
const filterWithMultipleConditionsAndDimensionality = newMeasureValueFilterWithOptions(
    localIdRef("localIdentifier"),
    {
        conditions: [
            {
                operator: "BETWEEN",
                from: 10,
                to: 50,
            },
            {
                operator: "BETWEEN",
                from: 100,
                to: 200,
            },
        ],
        dimensionality: [localIdRef("attr1"), localIdRef("attr2")],
    },
);

// Mock dimensionality items for the story
const dimensionalityItems = [
    {
        identifier: localIdRef("attr1"),
        title: "Attribute 1",
        type: "attribute" as const,
    },
    {
        identifier: localIdRef("attr2"),
        title: "Attribute 2",
        type: "attribute" as const,
    },
];

// eslint-disable-next-line no-restricted-exports
export default {
    title: "10 Filters/MeasureValueFilter",
};

export function FullFeatured() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <span className="dropdown-anchor-test" />
            <MeasureValueFilterDropdown
                filter={filterWithMultipleConditionsAndDimensionality}
                measureIdentifier="localIdentifier"
                onApply={action("applyClick")}
                onCancel={action("cancelClick")}
                anchorEl=".dropdown-anchor-test"
                enableMultipleConditions
                isDimensionalityEnabled
                dimensionality={dimensionalityItems}
                insightDimensionality={dimensionalityItems}
            />
        </div>
    );
}
FullFeatured.parameters = { kind: "full-featured", screenshots: scenarios } satisfies IStoryParameters;

export function WithTreatNullAsOptionEnabled() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <span className="dropdown-anchor-test" />
            <MeasureValueFilterDropdown
                filter={filter}
                measureIdentifier="localIdentifier"
                onApply={action("applyClick")}
                onCancel={action("cancelClick")}
                anchorEl=".dropdown-anchor-test"
                displayTreatNullAsZeroOption
            />
        </div>
    );
}
WithTreatNullAsOptionEnabled.parameters = {
    kind: "with-treat-null-as-option-enabled",
    screenshots: scenarios,
} satisfies IStoryParameters;

export function WithTreatNullAsOptionEnabledAndCheckedByDefault() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <span className="dropdown-anchor-test" />
            <MeasureValueFilterDropdown
                filter={filter}
                measureIdentifier="localIdentifier"
                onApply={action("applyClick")}
                onCancel={action("cancelClick")}
                anchorEl=".dropdown-anchor-test"
                displayTreatNullAsZeroOption
                treatNullAsZeroDefaultValue
            />
        </div>
    );
}
WithTreatNullAsOptionEnabledAndCheckedByDefault.parameters = {
    kind: "with-treat-null-as-option-enabled-and-checked-by-default",
    screenshots: scenarios,
} satisfies IStoryParameters;

export function WithDisabledOperatorSelection() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <span className="dropdown-anchor-test" />
            <MeasureValueFilterDropdown
                filter={filter}
                measureIdentifier="localIdentifier"
                onApply={action("applyClick")}
                onCancel={action("cancelClick")}
                anchorEl=".dropdown-anchor-test"
                enableOperatorSelection={false}
            />
        </div>
    );
}
WithDisabledOperatorSelection.parameters = {
    kind: "with-disabled-operator-selection",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function Localized() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <span className="dropdown-anchor-test" />
            <MeasureValueFilterDropdown
                filter={filter}
                measureIdentifier="localIdentifier"
                onApply={action("applyClick")}
                onCancel={action("cancelClick")}
                locale="de-DE"
                anchorEl=".dropdown-anchor-test"
            />
        </div>
    );
}
Localized.parameters = { kind: "localized", screenshots: scenarios } satisfies IStoryParameters;
