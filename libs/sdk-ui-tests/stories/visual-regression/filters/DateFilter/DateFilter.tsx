// (C) 2007-2019 GoodData Corporation
import {
    DateFilter,
    defaultDateFilterOptions,
    IUiAbsoluteDateFilterForm,
    IDateFilterOptionsByType,
} from "@gooddata/sdk-ui-filters";
import React from "react";
import { storiesOf } from "../../../_infra/storyRepository.js";
import { action } from "@storybook/addon-actions";
import { FilterStories } from "../../../_infra/storyGroups.js";
import { wrapWithTheme } from "../../themeWrapper.js";

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

storiesOf(`${FilterStories}/DateFilter`)
    .add(
        "full-featured",
        () => {
            return (
                <div style={wrapperStyle} className="screenshot-target">
                    <DateFilter
                        excludeCurrentPeriod={false}
                        selectedFilterOption={defaultDateFilterOptions.allTime}
                        filterOptions={filterOptions}
                        availableGranularities={[
                            "GDC.time.minute",
                            "GDC.time.hour",
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
                </div>
            );
        },
        {
            screenshots: {
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
        },
    )
    .add(
        "localized",
        () => {
            return (
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
                </div>
            );
        },
        {
            screenshots: {
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
        },
    )
    .add(
        "dateFormat",
        () => {
            return (
                <div style={wrapperStyle} className="screenshot-target">
                    <DateFilter
                        excludeCurrentPeriod={false}
                        selectedFilterOption={defaultDateFilterOptions.absoluteForm}
                        filterOptions={filterOptions}
                        isEditMode={false}
                        dateFilterMode="active"
                        dateFormat="yyyy/MM/dd"
                    />
                </div>
            );
        },
        { screenshot: true },
    )
    .add(
        "themed",
        () => {
            return wrapWithTheme(
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
            );
        },
        {
            screenshots: {
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
        },
    )
    .add(
        "Date filter aligned to the right",
        () => {
            return (
                <div style={{ width: 300, position: "absolute", right: 0 }} className="screenshot-target">
                    <DateFilter
                        excludeCurrentPeriod={false}
                        selectedFilterOption={defaultDateFilterOptions.allTime}
                        filterOptions={filterOptions}
                        availableGranularities={[
                            "GDC.time.minute",
                            "GDC.time.hour",
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
                </div>
            );
        },
        {
            screenshots: {
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
        },
    )
    .add(
        "dateformat with time",
        () => {
            const selectedFilterOption: IUiAbsoluteDateFilterForm = {
                localIdentifier: "ABSOLUTE_FORM",
                type: "absoluteForm",
                from: "2019-01-01 1:00",
                to: "2019-02-01 14:00",
                name: "",
                visible: true,
            };
            return (
                <div style={wrapperStyle} className="screenshot-target">
                    <DateFilter
                        customFilterName="Selected date"
                        excludeCurrentPeriod={false}
                        selectedFilterOption={selectedFilterOption}
                        filterOptions={filterOptions}
                        dateFilterMode="active"
                        dateFormat="yyyy/MM/dd"
                        isTimeForAbsoluteRangeEnabled={true}
                    />
                </div>
            );
        },
        {
            screenshots: {
                closed: {},
                opened: { clickSelector: ".s-date-filter-button", postInteractionWait: 200 },
            },
        },
    );
