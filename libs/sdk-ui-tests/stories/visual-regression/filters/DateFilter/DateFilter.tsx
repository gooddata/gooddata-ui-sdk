// (C) 2007-2019 GoodData Corporation
import {
    DateFilter,
    defaultDateFilterOptions,
    IUiAbsoluteDateFilterForm,
    IDateFilterOptionsByType,
} from "@gooddata/sdk-ui-filters";
import * as React from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { withMultipleScreenshots } from "../../../_infra/backstopWrapper";
import { FilterStories } from "../../../_infra/storyGroups";

import "@gooddata/sdk-ui-filters/styles/css/dateFilter.css";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };

const fixedAbsoluteDateForm: IUiAbsoluteDateFilterForm = {
    localIdentifier: "ABSOLUTE_FORM",
    type: "absoluteForm",
    from: "2019-01-01",
    to: "2019-02-01",
    name: "",
    visible: true,
};

const filterOptions: IDateFilterOptionsByType = {
    ...defaultDateFilterOptions,
    absoluteForm: fixedAbsoluteDateForm,
};

storiesOf(`${FilterStories}/DateFilter`, module)
    .add("full-featured", () => {
        return withMultipleScreenshots(
            <div style={wrapperStyle} className="screenshot-target">
                <DateFilter
                    excludeCurrentPeriod={false}
                    selectedFilterOption={defaultDateFilterOptions.allTime}
                    filterOptions={filterOptions}
                    availableGranularities={[
                        "GDC.time.date",
                        "GDC.time.month",
                        "GDC.time.quarter",
                        "GDC.time.year",
                    ]}
                    isEditMode={false}
                    dateFilterMode="active"
                    onApply={action("applyClick")}
                    onCancel={action("cancelClick")}
                    onOpen={action("onOpen")}
                    onClose={action("onClose")}
                />
            </div>,
            {
                closed: {},
                opened: { clickSelector: ".s-date-filter-button", postInteractionWait: 200 },
                "absolute-form": {
                    clickSelectors: [".s-date-filter-button", ".s-absolute-form"],
                    postInteractionWait: 200,
                },
                "relative-form": {
                    clickSelectors: [".s-date-filter-button", ".s-relative-form"],
                    postInteractionWait: 200,
                },
            },
        );
    })
    .add("localized", () => {
        return withMultipleScreenshots(
            <div style={wrapperStyle} className="screenshot-target">
                <DateFilter
                    locale="de-DE"
                    excludeCurrentPeriod={false}
                    selectedFilterOption={defaultDateFilterOptions.allTime}
                    filterOptions={filterOptions}
                    availableGranularities={[
                        "GDC.time.date",
                        "GDC.time.month",
                        "GDC.time.quarter",
                        "GDC.time.year",
                    ]}
                    isEditMode={false}
                    dateFilterMode="active"
                />
            </div>,
            {
                closed: {},
                opened: { clickSelector: ".s-date-filter-button", postInteractionWait: 200 },
                "absolute-form": {
                    clickSelectors: [".s-date-filter-button", ".s-absolute-form"],
                    postInteractionWait: 200,
                },
                "relative-form": {
                    clickSelectors: [".s-date-filter-button", ".s-relative-form"],
                    postInteractionWait: 200,
                },
            },
        );
    });
