// (C) 2024-2025 GoodData Corporation

import React from "react";
import { RecurrenceForm } from "@gooddata/sdk-ui-kit";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { action } from "@storybook/addon-actions";
import { storiesOf } from "../../../_infra/storyRepository.js";
import { UiKit } from "../../../_infra/storyGroups.js";
import { wrapWithTheme } from "../../themeWrapper.js";

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "./styles.scss";

const headerStyle = { marginBottom: "6px" };
const startDate = new Date("2021-02-11T02:03:14Z");
const hourlyCronExpression = "0 0 * ? * *";
const dailyCronExpression = "0 0 1 ? * *";
const customCronExpression = "0 0 1 ? DEC 1-3";

const onChange = (value: string) => {
    action("onChange")(value);
};

const RecurrenceFormTest: React.FC = () => {
    return (
        <IntlWrapper>
            <div className="library-component screenshot-target">
                <div id="first-example">
                    <h3 style={headerStyle}>Basic recurrence form</h3>
                    <RecurrenceForm
                        startDate={startDate}
                        cronExpression={hourlyCronExpression}
                        onChange={onChange}
                    />
                </div>
                <div>
                    <h3 style={headerStyle}>
                        No hourly recurrence, added timezone, changed time-date format and week start
                    </h3>
                    <RecurrenceForm
                        startDate={startDate}
                        cronExpression={dailyCronExpression}
                        onChange={onChange}
                        allowHourlyRecurrence={false}
                        timeFormat={"hh:mm A"}
                        dateFormat="dd.mm.yyyy"
                        timezone="America/New_York"
                        weekStart="Sunday"
                    />
                </div>
                <div>
                    <h3 style={headerStyle}>Custom cron expression provided</h3>
                    <RecurrenceForm
                        startDate={startDate}
                        cronExpression={customCronExpression}
                        onChange={onChange}
                    />
                </div>
                <div>
                    <h3 style={headerStyle}>No date provided</h3>
                    <RecurrenceForm
                        cronExpression={dailyCronExpression}
                        onChange={onChange}
                        timeFormat={"hh:mm A"}
                        dateFormat="dd.mm.yyyy"
                        timezone="America/New_York"
                        weekStart="Sunday"
                    />
                </div>
                <div>
                    <h3 style={headerStyle}>No recurrence label provided with occurence description</h3>
                    <RecurrenceForm
                        cronExpression={dailyCronExpression}
                        onChange={onChange}
                        timeFormat={"hh:mm A"}
                        dateFormat="dd.mm.yyyy"
                        timezone="America/New_York"
                        weekStart="Sunday"
                        repeatLabel=""
                        showRepeatTypeDescription={true}
                    />
                </div>
            </div>
        </IntlWrapper>
    );
};

const screenshotProps = {
    default: {},
    openedRecurrenceType: {
        clickSelector: "#first-example .s-recurrence-form-type",
        postInteractionWait: 200,
    },
};

storiesOf(`${UiKit}/RecurrenceForm`)
    .add("full-featured", () => <RecurrenceFormTest />, { screenshots: screenshotProps })
    .add("themed", () => wrapWithTheme(<RecurrenceFormTest />), { screenshots: screenshotProps });
