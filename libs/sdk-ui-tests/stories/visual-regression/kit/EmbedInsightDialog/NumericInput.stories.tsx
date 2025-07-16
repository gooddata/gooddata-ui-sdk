// (C) 2022-2025 GoodData Corporation
import React, { useState } from "react";

import { wrapWithTheme } from "../../themeWrapper.js";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/internal";
import { action } from "@storybook/addon-actions";
import { NumericInput } from "@gooddata/sdk-ui-kit";

const NumericInputExamples: React.VFC = () => {
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
};

export default {
    title: "12 UI Kit/EmbedInsightDialog/NumericInput",
};

export const FullFeatured = () => <NumericInputExamples />;
FullFeatured.parameters = { kind: "full-featured", screenshot: true };

export const Themed = () => wrapWithTheme(<NumericInputExamples />);
Themed.parameters = { kind: "themed", screenshot: true };
