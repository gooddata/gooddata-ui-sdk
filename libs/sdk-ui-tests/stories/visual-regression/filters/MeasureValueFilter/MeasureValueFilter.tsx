// (C) 2007-2019 GoodData Corporation
import React from "react";
import { MeasureValueFilterDropdown } from "@gooddata/sdk-ui-filters";
import { IMeasureValueFilter, localIdRef } from "@gooddata/sdk-model";
import { storiesOf } from "../../../_infra/storyRepository.js";
import { action } from "@storybook/addon-actions";
import { FilterStories } from "../../../_infra/storyGroups.js";

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

storiesOf(`${FilterStories}/MeasureValueFilter`)
    .add(
        "full-featured",
        () => {
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
        },
        { screenshots: scenarios },
    )
    .add(
        "with-treat-null-as-option-enabled",
        () => {
            return (
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
        },
        { screenshots: scenarios },
    )
    .add(
        "with-treat-null-as-option-enabled-and-checked-by-default",
        () => {
            return (
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
        },
        { screenshots: scenarios },
    )
    .add(
        "with-disabled-operator-selection",
        () => {
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
        },
        { screenshot: true },
    )
    .add(
        "localized",
        () => {
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
        },
        { screenshots: scenarios },
    );
