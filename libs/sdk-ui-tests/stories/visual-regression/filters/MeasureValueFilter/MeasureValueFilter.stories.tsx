// (C) 2007-2025 GoodData Corporation

import { action } from "storybook/actions";

import { IMeasureValueFilter, localIdRef } from "@gooddata/sdk-model";
import { MeasureValueFilterDropdown } from "@gooddata/sdk-ui-filters";

import "@gooddata/sdk-ui-filters/styles/css/measureValueFilter.css";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };

const scenarios = {
    closed: {},
    opened: { clickSelector: ".s-mvf-operator-dropdown-button", postInteractionWait: 200 },
    "between-selected": {
        clickSelectors: [".s-mvf-operator-dropdown-button", 200, ".s-mvf-operator-between"],
        postInteractionWait: 200,
    },
    "greater-than-selected": {
        clickSelectors: [".s-mvf-operator-dropdown-button", 200, ".s-mvf-operator-greater_than"],
        postInteractionWait: 200,
    },
};

// we do not have a proper factory function for ALL MVF, nor do we really need one
// this to satisfy sdk-ui-tests tsconfig that is stricter than that of sdk-ui-filters
const filter: IMeasureValueFilter = {
    measureValueFilter: {
        measure: localIdRef("localIdentifier"),
    },
};

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
FullFeatured.parameters = { kind: "full-featured", screenshots: scenarios };

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
};

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
};

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
WithDisabledOperatorSelection.parameters = { kind: "with-disabled-operator-selection", screenshot: true };

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
Localized.parameters = { kind: "localized", screenshots: scenarios };
