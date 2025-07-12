// (C) 2007-2025 GoodData Corporation
import {
    DateFilter,
    defaultDateFilterOptions,
    IUiAbsoluteDateFilterForm,
    IDateFilterOptionsByType,
} from "@gooddata/sdk-ui-filters";

import { action } from "storybook/actions";
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

export default {
    title: "10 Filters/DateFilter",
};

export const FullFeatured = () => (
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
FullFeatured.parameters = {
    kind: "full-featured",
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
        "relative-form-error": {
            clickSelectors: [
                ".s-date-filter-button",
                ".s-relative-form",
                ".s-relative-range-picker-from .s-relative-range-input",
                ".s-relative-range-picker-to .s-relative-range-input",
                ".s-relative-form",
            ],
            postInteractionWait: 200,
        },
    },
};

export const Localized = () => (
    <div style={wrapperStyle} className="screenshot-target">
        <DateFilter
            locale="de-DE"
            excludeCurrentPeriod={false}
            selectedFilterOption={defaultDateFilterOptions.allTime}
            filterOptions={filterOptions}
            availableGranularities={["GDC.time.date", "GDC.time.month", "GDC.time.quarter", "GDC.time.year"]}
            isEditMode={false}
            dateFilterMode="active"
        />
    </div>
);
Localized.parameters = {
    kind: "localized",
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
};

export const Dateformat = () => (
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
Dateformat.parameters = { kind: "dateFormat", screenshot: true };

export const Themed = () =>
    wrapWithTheme(
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
Themed.parameters = {
    kind: "themed",
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
};

export const DateFilterAlignedToTheRight = () => (
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
DateFilterAlignedToTheRight.parameters = {
    kind: "Date filter aligned to the right",
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
};

export const DateformatWithTime = () => {
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
};
DateformatWithTime.parameters = {
    kind: "dateformat with time",
    screenshots: {
        closed: {},
        opened: { clickSelector: ".s-date-filter-button", postInteractionWait: 200 },
    },
};
