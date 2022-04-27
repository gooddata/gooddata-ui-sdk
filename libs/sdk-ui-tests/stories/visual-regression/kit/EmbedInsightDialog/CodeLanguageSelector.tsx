// (C) 2022 GoodData Corporation
import React, { useState } from "react";
import { storiesOf } from "../../../_infra/storyRepository";
import { UiKit } from "../../../_infra/storyGroups";
import { wrapWithTheme } from "../../themeWrapper";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/dist/internal/utils/internalIntlProvider";
import { CodeLanguageSelector, CodeLanguageType } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export const CodeLanguageSelectorExamples: React.VFC = () => {
    const [lang, setLang] = useState<CodeLanguageType>("ts");

    const onLanguageChanged = (lang: CodeLanguageType) => {
        setLang(lang);
    };

    return (
        <InternalIntlWrapper>
            <div className="screenshot-target library-component">
                <CodeLanguageSelector selectedLanguage={lang} onLanguageChanged={onLanguageChanged} />
            </div>
        </InternalIntlWrapper>
    );
};

storiesOf(`${UiKit}/EmbedInsightDialog/CodeLanguageSelector`)
    .add("full-featured", () => <CodeLanguageSelectorExamples />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<CodeLanguageSelectorExamples />), { screenshot: true });
