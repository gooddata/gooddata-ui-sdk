// (C) 2022-2025 GoodData Corporation

import { useState } from "react";

import { action } from "storybook/actions";

import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/internal";
import { NumericInput } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters } from "../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../themeWrapper.js";

function NumericInputExamples() {
    const [value, setValue] = useState<string>("400");

    const onValueChanged = (e: string) => {
        // eslint-disable-next-line no-console
        console.log(e);
        setValue(e);
    };

    return (
        <InternalIntlWrapper>
            <div className="screenshot-target library-component" style={{ width: 400 }}>
                <h4> full controlled example</h4>
                <NumericInput value={value} onValueChanged={onValueChanged} />
            </div>

            <div className="screenshot-target library-component" style={{ width: 400 }}>
                <h4> Numeric input error</h4>
                <NumericInput value="0." onValueChanged={action("onValueChanged")} />
            </div>
        </InternalIntlWrapper>
    );
}

// eslint-disable-next-line no-restricted-exports
export default {
    title: "12 UI Kit/EmbedInsightDialog/NumericInput",
};

export function FullFeatured() {
    return <NumericInputExamples />;
}
FullFeatured.parameters = { kind: "full-featured", screenshot: true } satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<NumericInputExamples />);
Themed.parameters = { kind: "themed", screenshot: true } satisfies IStoryParameters;
