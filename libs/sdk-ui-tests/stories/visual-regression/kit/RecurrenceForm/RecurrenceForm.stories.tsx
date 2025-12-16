// (C) 2024-2025 GoodData Corporation

import { action } from "storybook/actions";

import { IntlWrapper } from "@gooddata/sdk-ui";
import { RecurrenceForm } from "@gooddata/sdk-ui-kit";

import { type INeobackstopConfig, type IStoryParameters, State } from "../../../_infra/backstopScenario.js";
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

function RecurrenceFormTest() {
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
                        showRepeatTypeDescription
                    />
                </div>
            </div>
        </IntlWrapper>
    );
}

const screenshotProps: INeobackstopConfig = {
    default: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
    openedRecurrenceType: {
        readySelector: { selector: ".screenshot-target", state: State.Attached },
        clickSelector: "#first-example .s-recurrence-form-type",
        postInteractionWait: { delay: 200 },
    },
};

// eslint-disable-next-line no-restricted-exports
export default {
    title: "12 UI Kit/RecurrenceForm",
};

export function FullFeatured() {
    return <RecurrenceFormTest />;
}
FullFeatured.parameters = { kind: "full-featured", screenshots: screenshotProps } satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<RecurrenceFormTest />);
Themed.parameters = { kind: "themed", screenshots: screenshotProps } satisfies IStoryParameters;
