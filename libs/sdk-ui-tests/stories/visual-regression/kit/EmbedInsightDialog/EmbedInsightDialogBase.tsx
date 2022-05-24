// (C) 2022 GoodData Corporation
import React from "react";
import { action } from "@storybook/addon-actions";
import { storiesOf } from "../../../_infra/storyRepository";
import { UiKit } from "../../../_infra/storyGroups";
import { wrapWithTheme } from "../../themeWrapper";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/dist/internal/utils/internalIntlProvider";
import { EmbedInsightDialogBase } from "@gooddata/sdk-ui-kit";
import { code } from "./CodeMock";

/**
 * @internal
 */
export const EmbedInsightDialogBaseExamples: React.VFC = () => {
    return (
        <InternalIntlWrapper>
            <div className="screenshot-target" style={{ width: "100%", height: "100%" }}>
                <div className="library-component">
                    <h4>EmbedInsightDialogBase by definition</h4>
                </div>

                <EmbedInsightDialogBase
                    code={code}
                    codeLanguage={"ts"}
                    codeOption={{
                        type: "definition",
                        includeConfiguration: true,
                        customHeight: true,
                        height: "300",
                    }}
                    /* propertiesLink={
                        "https://sdk.gooddata.com/gooddata-ui/docs/area_chart_component.html#properties"
                    }*/
                    integrationDocLink={"https://sdk.gooddata.com/gooddata-ui/docs/platform_integration.html"}
                    onClose={action("onClose")}
                    onCopyCode={action("onCopyCode")}
                    onCodeLanguageChange={action("onCodeLanguageChange")}
                    onCodeOptionChange={action("onCodeOptionChange")}
                />

                <div className="library-component">
                    <h4>EmbedInsightDialogBase by reference</h4>
                </div>

                <EmbedInsightDialogBase
                    code={code}
                    codeLanguage={"ts"}
                    codeOption={{
                        type: "reference",
                        displayTitle: true,
                        customHeight: true,
                        height: "300",
                    }}
                    onClose={action("onClose")}
                    onCopyCode={action("onCopyCode")}
                    onCodeLanguageChange={action("onCodeLanguageChange")}
                    onCodeOptionChange={action("onCodeOptionChange")}
                />
            </div>
        </InternalIntlWrapper>
    );
};

storiesOf(`${UiKit}/EmbedInsightDialog/EmbedInsightDialogBase`)
    .add("full-featured", () => <EmbedInsightDialogBaseExamples />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<EmbedInsightDialogBaseExamples />), { screenshot: true });

export const TEST: React.VFC = () => {
    return (
        <InternalIntlWrapper>
            <div className="screenshot-target">
                <div className="library-component">
                    <h4>EmbedInsightDialogBase by definition</h4>
                </div>

                <EmbedInsightDialogBase
                    code={code}
                    codeLanguage={"ts"}
                    codeOption={{
                        type: "definition",
                        includeConfiguration: true,
                        customHeight: true,
                        height: "300",
                    }}
                    /* propertiesLink={
                        "https://sdk.gooddata.com/gooddata-ui/docs/area_chart_component.html#properties"
                    }*/
                    integrationDocLink={"https://sdk.gooddata.com/gooddata-ui/docs/platform_integration.html"}
                    onClose={action("onClose")}
                    onCopyCode={action("onCopyCode")}
                    onCodeLanguageChange={action("onCodeLanguageChange")}
                    onCodeOptionChange={action("onCodeOptionChange")}
                />
            </div>
        </InternalIntlWrapper>
    );
};

storiesOf(`${UiKit}/EmbedInsightDialog/EmbedInsightDialogBase/test`)
    .add("full-featured", () => <TEST />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<TEST />), { screenshot: true });
