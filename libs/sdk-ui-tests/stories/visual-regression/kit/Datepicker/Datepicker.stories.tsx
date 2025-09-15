// (C) 2020-2025 GoodData Corporation
import React, { useState } from "react";

import { Datepicker } from "@gooddata/sdk-ui-kit";

import { wrapWithTheme } from "../../themeWrapper.js";

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "./styles.scss";

const defaultDateFormat = "MM/dd/yyyy";

function DatePickerTest() {
    const [date, setDate] = useState<Date>(new Date(2015, 2, 15));
    const defaultProps = {
        date,
        dateFormat: defaultDateFormat,
    };

    return (
        <div className="library-component screenshot-target gd-datepicker">
            <h4>Basic picker</h4>
            <Datepicker {...defaultProps} />

            <h4>Small version</h4>
            <Datepicker size="small" {...defaultProps} />

            <h4>Viewport fitting</h4>
            <div className="pickerExampleFlexRow">
                <div>
                    Datepicker fits to viewport automatically by default. Open the picker on the right to see
                    it it aligned to the right edge of date input.
                </div>
                <div>
                    <Datepicker {...defaultProps} />
                </div>
            </div>
            <div className="pickerExampleFlexRow">
                <div>
                    <p>
                        You can override fitting by specification of custom
                        <code>alignPoints</code>. In this case of only one align point <code>bl tl</code>{" "}
                        picker overflows viewport.
                    </p>
                    <p>
                        Supported align points are <code>bl tl</code>, <code>br tr</code>,<code>tl bl</code>,{" "}
                        <code>tr br</code>. See Bubble documentation for anchor points examples.
                    </p>
                </div>
                <div>
                    <Datepicker alignPoints={[{ align: "bl tl" }]} {...defaultProps} />
                </div>
            </div>

            <h4>Set date externally</h4>
            <div id="external-date">
                <Datepicker {...defaultProps} />
                <br />
                <button
                    onClick={() => {
                        setDate(new Date());
                    }}
                >
                    Externally set current date
                </button>
            </div>
        </div>
    );
}

const openedProps = {
    clickSelector: "#external-date input",
    postInteractionWait: 200,
};

const screenshotScenarios = {
    closed: {},
    opened: openedProps,
    "next-month": {
        clickSelectors: ["#external-date input", ".rdp-button_next"],
        postInteractionWait: 200,
    },
};

export default {
    title: "12 UI Kit/DatePicker",
};

export function FullFeatured() {
    return <DatePickerTest />;
}
FullFeatured.parameters = { kind: "full-featured", screenshots: screenshotScenarios };

export const Themed = () => wrapWithTheme(<DatePickerTest />);
Themed.parameters = { kind: "themed", screenshot: openedProps };
