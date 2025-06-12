// (C) 2022 GoodData Corporation
import React, { useState } from "react";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/internal";
import { CodeLanguageSelect, CodeLanguageType } from "@gooddata/sdk-ui-kit";

import { storiesOf } from "../../../_infra/storyRepository.js";
import { UiKit } from "../../../_infra/storyGroups.js";
import { wrapWithTheme } from "../../themeWrapper.js";

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
                <CodeLanguageSelect selectedLanguage={lang} onLanguageChanged={onLanguageChanged} />
            </div>
        </InternalIntlWrapper>
    );
};

storiesOf(`${UiKit}/EmbedInsightDialog/CodeLanguageSelect`)
    .add("full-featured", () => <CodeLanguageSelectorExamples />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<CodeLanguageSelectorExamples />), { screenshot: true });
