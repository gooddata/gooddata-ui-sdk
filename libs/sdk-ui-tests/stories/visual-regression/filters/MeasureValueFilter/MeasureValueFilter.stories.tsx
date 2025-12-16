// (C) 2007-2025 GoodData Corporation

import { action } from "storybook/actions";

import { type IMeasureValueFilter, localIdRef } from "@gooddata/sdk-model";
import { MeasureValueFilterDropdown } from "@gooddata/sdk-ui-filters";

import "@gooddata/sdk-ui-filters/styles/css/measureValueFilter.css";
import { type INeobackstopConfig, type IStoryParameters, State } from "../../../_infra/backstopScenario.js";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };

const scenarios: INeobackstopConfig = {
    closed: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
    opened: {
        readySelector: { selector: ".screenshot-target", state: State.Attached },
        clickSelector: ".s-mvf-operator-dropdown-button",
        delay: {
            postOperation: 200,
        },
    },
    "between-selected": {
        readySelector: { selector: ".screenshot-target", state: State.Attached },
        clickSelectors: [
            { selector: ".s-mvf-operator-dropdown-button" },
            { selector: ".s-mvf-operator-between" },
        ],
        delay: {
            postOperation: 200,
        },
    },
    "greater-than-selected": {
        readySelector: { selector: ".screenshot-target", state: State.Attached },
        clickSelectors: [
            { selector: ".s-mvf-operator-dropdown-button" },
            { selector: ".s-mvf-operator-greater_than" },
        ],
        delay: {
            postOperation: 200,
        },
    },
};

// we do not have a proper factory function for ALL MVF, nor do we really need one
// this to satisfy sdk-ui-tests tsconfig that is stricter than that of sdk-ui-filters
const filter: IMeasureValueFilter = {
    measureValueFilter: {
        measure: localIdRef("localIdentifier"),
    },
};

// eslint-disable-next-line no-restricted-exports
export default {
    title: "10 Filters/MeasureValueFilter",
};

export function FullFeatured() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <MeasureValueFilterDropdown
                filter={filter}
                measureIdentifier="localIdentifier"
                onApply={action("applyClick")}
                onCancel={action("cancelClick")}
                anchorEl="screenshot-target"
            />
        </div>
    );
}
FullFeatured.parameters = { kind: "full-featured", screenshots: scenarios } satisfies IStoryParameters;

export function WithTreatNullAsOptionEnabled() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <MeasureValueFilterDropdown
                filter={filter}
                measureIdentifier="localIdentifier"
                onApply={action("applyClick")}
                onCancel={action("cancelClick")}
                anchorEl="screenshot-target"
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
            <MeasureValueFilterDropdown
                filter={filter}
                measureIdentifier="localIdentifier"
                onApply={action("applyClick")}
                onCancel={action("cancelClick")}
                anchorEl="screenshot-target"
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
            <MeasureValueFilterDropdown
                filter={filter}
                measureIdentifier="localIdentifier"
                onApply={action("applyClick")}
                onCancel={action("cancelClick")}
                anchorEl="screenshot-target"
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
            <MeasureValueFilterDropdown
                filter={filter}
                measureIdentifier="localIdentifier"
                onApply={action("applyClick")}
                onCancel={action("cancelClick")}
                locale="de-DE"
                anchorEl="screenshot-target"
            />
        </div>
    );
}
Localized.parameters = { kind: "localized", screenshots: scenarios } satisfies IStoryParameters;
