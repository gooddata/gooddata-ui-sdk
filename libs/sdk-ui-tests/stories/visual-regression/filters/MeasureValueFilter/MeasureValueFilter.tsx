// (C) 2007-2019 GoodData Corporation
import { MeasureValueFilterDropdown } from "@gooddata/sdk-ui-filters";
import React from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { withMultipleScreenshots, withScreenshot } from "../../../_infra/backstopWrapper";
import { FilterStories } from "../../../_infra/storyGroups";

import "@gooddata/sdk-ui-filters/styles/css/measureValueFilter.css";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };

const scenarios = {
    closed: {},
    opened: { clickSelector: ".s-mvf-operator-dropdown-button", postInteractionWait: 200 },
    "between-selected": {
        clickSelectors: [".s-mvf-operator-dropdown-button", ".s-mvf-operator-between"],
        postInteractionWait: 200,
    },
    "greater-than-selected": {
        clickSelectors: [".s-mvf-operator-dropdown-button", ".s-mvf-operator-greater_than"],
        postInteractionWait: 200,
    },
};

storiesOf(`${FilterStories}/MeasureValueFilter`, module)
    .add("full-featured", () => {
        return withMultipleScreenshots(
            <div style={wrapperStyle} className="screenshot-target">
                <MeasureValueFilterDropdown
                    measureIdentifier="localIdentifier"
                    onApply={action("applyClick")}
                    onCancel={action("cancelClick")}
                    anchorEl="screenshot-target"
                />
            </div>,
            scenarios,
        );
    })
    .add("with-treat-null-as-option-enabled", () => {
        return withMultipleScreenshots(
            <div style={wrapperStyle} className="screenshot-target">
                <MeasureValueFilterDropdown
                    measureIdentifier="localIdentifier"
                    onApply={action("applyClick")}
                    onCancel={action("cancelClick")}
                    anchorEl="screenshot-target"
                    displayTreatNullAsZeroOption={true}
                />
            </div>,
            scenarios,
        );
    })
    .add("with-treat-null-as-option-enabled-and-checked-by-default", () => {
        return withMultipleScreenshots(
            <div style={wrapperStyle} className="screenshot-target">
                <MeasureValueFilterDropdown
                    measureIdentifier="localIdentifier"
                    onApply={action("applyClick")}
                    onCancel={action("cancelClick")}
                    anchorEl="screenshot-target"
                    displayTreatNullAsZeroOption={true}
                    treatNullAsZeroDefaultValue={true}
                />
            </div>,
            scenarios,
        );
    })
    .add("with-disabled-operator-selection", () => {
        return withScreenshot(
            <div style={wrapperStyle} className="screenshot-target">
                <MeasureValueFilterDropdown
                    measureIdentifier="localIdentifier"
                    onApply={action("applyClick")}
                    onCancel={action("cancelClick")}
                    anchorEl="screenshot-target"
                    enableOperatorSelection={false}
                />
            </div>,
        );
    })
    .add("localized", () => {
        return withMultipleScreenshots(
            <div style={wrapperStyle} className="screenshot-target">
                <MeasureValueFilterDropdown
                    measureIdentifier="localIdentifier"
                    onApply={action("applyClick")}
                    onCancel={action("cancelClick")}
                    locale="de-DE"
                    anchorEl="screenshot-target"
                />
            </div>,
            scenarios,
        );
    });
