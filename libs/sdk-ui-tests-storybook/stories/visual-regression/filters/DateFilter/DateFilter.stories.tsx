// (C) 2007-2026 GoodData Corporation

import { action } from "storybook/actions";

import {
    DateFilter,
    type IDateFilterProps,
    type IUiAbsoluteDateFilterForm,
    defaultDateFilterOptions,
} from "@gooddata/sdk-ui-filters";

import { type IStoryParameters, State } from "../../../_infra/backstopScenario.js";
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

const requiredProps = {
    availableGranularities: ["GDC.time.date", "GDC.time.month", "GDC.time.quarter", "GDC.time.year"],
    dateFilterMode: "active",
    excludeCurrentPeriod: false,
    filterOptions: { ...defaultDateFilterOptions, absoluteForm: fixedAbsoluteDateForm },
    selectedFilterOption: defaultDateFilterOptions.allTime!,
    onApply: action("applyClick"),
    onCancel: action("cancelClick"),
    onOpen: action("onOpen"),
    onClose: action("onClose"),
} satisfies IDateFilterProps;

export default {
    title: "10 Filters/DateFilter",
};

export function FullFeatured() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <DateFilter
                {...requiredProps}
                availableGranularities={[
                    "GDC.time.minute",
                    "GDC.time.hour",
                    "GDC.time.date",
                    "GDC.time.month",
                    "GDC.time.quarter",
                    "GDC.time.year",
                ]}
            />
        </div>
    );
}
FullFeatured.parameters = {
    kind: "full-featured",
    screenshots: {
        closed: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
        opened: {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelector: ".s-date-filter-button",
            delay: {
                postOperation: 200,
            },
        },
        "absolute-form": {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelectors: [{ selector: ".s-date-filter-button" }, { selector: ".s-absolute-form-button" }],
            delay: {
                postOperation: 200,
            },
        },
        "relative-form": {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelectors: [{ selector: ".s-date-filter-button" }, { selector: ".s-relative-form-button" }],
            delay: {
                postOperation: 200,
            },
        },
        "relative-form-error": {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelectors: [
                { selector: ".s-date-filter-button" },
                { selector: ".s-relative-form-button" },
                { selector: ".s-relative-range-picker-from .s-relative-range-input" },
                { selector: ".s-relative-range-picker-to .s-relative-range-input" },
                { selector: ".s-granularity-month" },
            ],
            delay: {
                postOperation: 200,
            },
        },
    },
} satisfies IStoryParameters;

export function Localized() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <DateFilter {...requiredProps} locale="de-DE" />
        </div>
    );
}
Localized.parameters = {
    kind: "localized",
    screenshots: {
        closed: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
        opened: {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelector: ".s-date-filter-button",
            delay: {
                postOperation: 200,
            },
        },
        "absolute-form": {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelectors: [{ selector: ".s-date-filter-button" }, { selector: ".s-absolute-form-button" }],
            delay: {
                postOperation: 200,
            },
        },
        "relative-form": {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelectors: [{ selector: ".s-date-filter-button" }, { selector: ".s-relative-form-button" }],
            delay: {
                postOperation: 200,
            },
        },
    },
} satisfies IStoryParameters;

export function Dateformat() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <DateFilter
                {...requiredProps}
                selectedFilterOption={defaultDateFilterOptions.absoluteForm}
                dateFormat="yyyy/MM/dd"
            />
        </div>
    );
}
Dateformat.parameters = {
    kind: "dateFormat",
    screenshot: {
        readySelector: { selector: ".screenshot-target", state: State.Attached },
        misMatchThreshold: 0.1,
    }, // shows current date, which changes (every day)
} satisfies IStoryParameters;

export const Themed = () =>
    wrapWithTheme(
        <div style={wrapperStyle} className="screenshot-target">
            <DateFilter {...requiredProps} dateFilterMode="active" />
        </div>,
    );
Themed.parameters = {
    kind: "themed",
    screenshots: {
        closed: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
        opened: {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelector: ".s-date-filter-button",
            delay: {
                postOperation: 200,
            },
        },
        "absolute-form": {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelectors: [{ selector: ".s-date-filter-button" }, { selector: ".s-absolute-form-button" }],
            delay: {
                postOperation: 200,
            },
        },
        "relative-form": {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelectors: [{ selector: ".s-date-filter-button" }, { selector: ".s-relative-form-button" }],
            delay: {
                postOperation: 200,
            },
        },
    },
} satisfies IStoryParameters;

export function DateFilterAlignedToTheRight() {
    return (
        <div style={{ width: 300, position: "absolute", right: 0 }} className="screenshot-target">
            <DateFilter
                {...requiredProps}
                availableGranularities={[
                    "GDC.time.minute",
                    "GDC.time.hour",
                    "GDC.time.date",
                    "GDC.time.month",
                    "GDC.time.quarter",
                    "GDC.time.year",
                ]}
            />
        </div>
    );
}
DateFilterAlignedToTheRight.parameters = {
    kind: "Date filter aligned to the right",
    screenshots: {
        closed: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
        opened: {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelector: ".s-date-filter-button",
            delay: {
                postOperation: 200,
            },
        },
        "absolute-form": {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelectors: [{ selector: ".s-date-filter-button" }, { selector: ".s-absolute-form-button" }],
            delay: {
                postOperation: 200,
            },
        },
        "relative-form": {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelectors: [{ selector: ".s-date-filter-button" }, { selector: ".s-relative-form-button" }],
            delay: {
                postOperation: 200,
            },
        },
    },
} satisfies IStoryParameters;
export function DateformatWithTime() {
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
                {...requiredProps}
                customFilterName="Selected date"
                selectedFilterOption={selectedFilterOption}
                dateFormat="yyyy/MM/dd"
                isTimeForAbsoluteRangeEnabled
            />
        </div>
    );
}
DateformatWithTime.parameters = {
    kind: "dateformat with time",
    screenshots: {
        closed: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
        opened: {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelectors: [{ selector: ".s-date-filter-button" }, { selector: ".s-absolute-form-button" }],
            postInteractionWait: { delay: 200 },
        },
    },
} satisfies IStoryParameters;
