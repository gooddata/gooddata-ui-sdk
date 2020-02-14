// (C) 2007-2019 GoodData Corporation
import { MeasureValueFilterDropdown } from "@gooddata/sdk-ui-filters";
import * as React from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { withMultipleScreenshots } from "../../_infra/backstopWrapper";
import { FilterStories } from "../../_infra/storyGroups";

import "@gooddata/sdk-ui-filters/styles/css/measureValueFilter.css";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };

const scenarios = {
    closed: {},
    opened: { clickSelector: ".s-mvf-dropdown-button", postInteractionWait: 200 },
    "opened-operator-dropdown": {
        clickSelectors: [".s-mvf-dropdown-button", ".s-mvf-operator-dropdown-button"],
        postInteractionWait: 200,
    },
    "between-selected": {
        clickSelectors: [
            ".s-mvf-dropdown-button",
            ".s-mvf-operator-dropdown-button",
            ".s-mvf-operator-between",
        ],
        postInteractionWait: 200,
    },
    "greater-than-selected": {
        clickSelectors: [
            ".s-mvf-dropdown-button",
            ".s-mvf-operator-dropdown-button",
            ".s-mvf-operator-greater_than",
        ],
        postInteractionWait: 200,
    },
};

storiesOf(`${FilterStories}/MeasureValueFilter`, module)
    .add("full-featured", () => {
        return withMultipleScreenshots(
            <div style={wrapperStyle} className="screenshot-target">
                <MeasureValueFilterDropdown
                    measureTitle="Measure"
                    measureIdentifier="localIdentifier"
                    onApply={action("applyClick")}
                />
            </div>,
            scenarios,
        );
    })
    .add("localized", () => {
        return withMultipleScreenshots(
            <div style={wrapperStyle} className="screenshot-target">
                <MeasureValueFilterDropdown
                    measureTitle="Measure"
                    measureIdentifier="localIdentifier"
                    onApply={action("applyClick")}
                    locale="de-DE"
                />
            </div>,
            scenarios,
        );
    });
