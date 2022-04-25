// (C) 2022 GoodData Corporation
import React, { useState } from "react";
import { storiesOf } from "../../../_infra/storyRepository";
import { UiKit } from "../../../_infra/storyGroups";
import { wrapWithTheme } from "../../themeWrapper";

// import { CodeLanguageSelector } from "@gooddata/sdk-ui-kit"; TODO FIX import
import { CodeLanguageSelector } from "@gooddata/sdk-ui-kit/src/Dialog/EmbedInsightDialog/EmbedInsightDialogBase/components/CodeLanguageSelector";
import { CodeLanguageType } from "@gooddata/sdk-ui-kit/src/Dialog/EmbedInsightDialog/EmbedInsightDialogBase/EmbedInsightDialogBase";

/**
 * @internal
 */
export const CodeLanguageSelectorExamples: React.VFC = () => {
    const [lang, setLang] = useState<CodeLanguageType>("ts");

    const onLanguageChanged = (lang: CodeLanguageType) => {
        setLang(lang);
    };

    return (
        <>
            <div className="screenshot-target library-component">
                <CodeLanguageSelector selectedLanguage={lang} onLanguageChanged={onLanguageChanged} />
            </div>
        </>
    );
};

storiesOf(`${UiKit}/EmbedInsightDialog/CodeLanguageSelector`)
    .add("full-featured", () => <CodeLanguageSelectorExamples />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<CodeLanguageSelectorExamples />), { screenshot: true });
