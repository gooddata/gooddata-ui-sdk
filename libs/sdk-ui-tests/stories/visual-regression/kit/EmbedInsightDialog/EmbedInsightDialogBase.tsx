// (C) 2022 GoodData Corporation
import React from "react";
import { action } from "@storybook/addon-actions";
import { storiesOf } from "../../../_infra/storyRepository";
import { UiKit } from "../../../_infra/storyGroups";
import { wrapWithTheme } from "../../themeWrapper";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/dist/internal/utils/internalIntlProvider";

// import { EmbedInsightDialogBase } from "@gooddata/sdk-ui-kit"; TODO FIX import
import { EmbedInsightDialogBase } from "@gooddata/sdk-ui-kit/src/Dialog/EmbedInsightDialog/EmbedInsightDialogBase/EmbedInsightDialogBase";
import { code } from "./CodeMock";

/**
 * @internal
 */
export const EmbedInsightDialogBaseExamples: React.VFC = () => {
    return (
        <InternalIntlWrapper>
            <div className="screenshot-target" style={{ width: "100%", height: "100%" }}>
                <div className="library-component">
                    <h4>EmbedInsightDialogBase</h4>
                </div>

                <EmbedInsightDialogBase
                    code={code}
                    codeByReference={true}
                    onClose={action("onClose")}
                    onCopyCode={action("onCopyCode")}
                />
            </div>
        </InternalIntlWrapper>
    );
};

storiesOf(`${UiKit}/EmbedInsightDialog/EmbedInsightDialogBase`)
    .add("full-featured", () => <EmbedInsightDialogBaseExamples />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<EmbedInsightDialogBaseExamples />), { screenshot: true });
