// (C) 2007-2025 GoodData Corporation
import React from "react";
import { MeasureValueFilterDropdown } from "@gooddata/sdk-ui-filters";
import { IMeasureValueFilter, localIdRef } from "@gooddata/sdk-model";

import { action } from "@storybook/addon-actions";
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

export const FullFeatured = () => (
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
FullFeatured.parameters = { kind: "full-featured", screenshots: scenarios };

export const WithTreatNullAsOptionEnabled = () => (
    <div style={wrapperStyle} className="screenshot-target">
        <MeasureValueFilterDropdown
            filter={filter}
            measureIdentifier="localIdentifier"
            onApply={action("applyClick")}
            onCancel={action("cancelClick")}
            anchorEl="screenshot-target"
            displayTreatNullAsZeroOption={true}
        />
    </div>
);
WithTreatNullAsOptionEnabled.parameters = {
    kind: "with-treat-null-as-option-enabled",
    screenshots: scenarios,
};

export const WithTreatNullAsOptionEnabledAndCheckedByDefault = () => (
    <div style={wrapperStyle} className="screenshot-target">
        <MeasureValueFilterDropdown
            filter={filter}
            measureIdentifier="localIdentifier"
            onApply={action("applyClick")}
            onCancel={action("cancelClick")}
            anchorEl="screenshot-target"
            displayTreatNullAsZeroOption={true}
            treatNullAsZeroDefaultValue={true}
        />
    </div>
);
WithTreatNullAsOptionEnabledAndCheckedByDefault.parameters = {
    kind: "with-treat-null-as-option-enabled-and-checked-by-default",
    screenshots: scenarios,
};

export const WithDisabledOperatorSelection = () => (
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
WithDisabledOperatorSelection.parameters = { kind: "with-disabled-operator-selection", screenshot: true };

export const Localized = () => (
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
Localized.parameters = { kind: "localized", screenshots: scenarios };
