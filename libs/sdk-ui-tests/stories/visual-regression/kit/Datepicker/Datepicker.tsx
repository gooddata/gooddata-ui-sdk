// (C) 2020 GoodData Corporation
import { Datepicker } from "@gooddata/sdk-ui-kit";
import React, { useState } from "react";
import { storiesOf } from "@storybook/react";
import { UiKit } from "../../../_infra/storyGroups";
import { withMultipleScreenshots } from "../../../_infra/backstopWrapper";

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "./styles.scss";

const DatePickerTest: React.FC = () => {
    const [date, setDate] = useState<Date>(new Date(2015, 2, 15));

    return (
        <div className="library-component screenshot-target gd-datepicker">
            <h4>Basic picker</h4>
            <Datepicker date={date} />

            <h4>Small version</h4>
            <Datepicker size="small" date={date} />

            <h4>Viewport fitting</h4>
            <div className="pickerExampleFlexRow">
                <div>
                    Datepicker fits to viewport automatically by default. Open the picker on the right to see
                    it it aligned to the right edge of date input.
                </div>
                <div>
                    <Datepicker date={date} />
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
                    <Datepicker alignPoints={[{ align: "bl tl" }]} date={date} />
                </div>
            </div>

            <h4>Set date externally</h4>
            <div id="external-date">
                <Datepicker date={date} />
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
};

storiesOf(`${UiKit}/DatePicker`, module).add("full-featured", () => {
    return withMultipleScreenshots(<DatePickerTest />, {
        closed: {},
        opened: {
            clickSelector: "#external-date input",
            postInteractionWait: 200,
        },
        "next-month": {
            clickSelectors: ["#external-date input", ".DayPicker-NavButton--next"],
            postInteractionWait: 200,
        },
    });
});
