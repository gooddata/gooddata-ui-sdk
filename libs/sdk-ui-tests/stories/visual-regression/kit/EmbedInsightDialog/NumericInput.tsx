// (C) 2022 GoodData Corporation
import React, { useState } from "react";
import { storiesOf } from "../../../_infra/storyRepository";
import { UiKit } from "../../../_infra/storyGroups";
import { wrapWithTheme } from "../../themeWrapper";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/dist/internal/utils/internalIntlProvider";

// import { CodeLanguageSelector } from "@gooddata/sdk-ui-kit"; TODO FIX import
import { NumericInput } from "@gooddata/sdk-ui-kit/src/Dialog/EmbedInsightDialog/EmbedInsightDialogBase/components/NumericInput";
import { action } from "@storybook/addon-actions";

/**
 * @internal
 */
export const NumericInputExamples: React.VFC = () => {
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

storiesOf(`${UiKit}/EmbedInsightDialog/NumericInput`)
    .add("full-featured", () => <NumericInputExamples />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<NumericInputExamples />), { screenshot: true });
