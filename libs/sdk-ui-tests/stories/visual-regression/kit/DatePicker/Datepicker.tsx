import { DatePicker } from "@gooddata/sdk-ui-kit";
import React, { useState } from "react";
import { storiesOf } from "@storybook/react";
import { UiKit } from "../../../_infra/storyGroups";

import "@gooddata/sdk-ui-kit/styles/css/main.css";

const DatePickerTest: React.FC = () => {
    const [date, setDate] = useState<Date>(new Date(2015, 2, 15));

    return (
        <div>
            <h4>Basic picker</h4>
            <DatePicker date={new Date()} />

            <h4>Small version</h4>
            <DatePicker size="small" date={new Date()} />

            <h4>Viewport fitting</h4>
            <div className="pickerExampleFlexRow">
                <div>
                    Datepicker fits to viewport automatically by default. Open the picker on the right to see
                    it it aligned to the right edge of date input.
                </div>
                <div>
                    <DatePicker date={new Date()} />
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
                    <DatePicker alignPoints={[{ align: "bl tl" }]} date={new Date()} />
                </div>
            </div>

            <h4>Set date externally</h4>
            <div>
                <DatePicker date={date} />
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

storiesOf(`${UiKit}/DatePicker`, module).add("full-featured", () => <DatePickerTest />);
