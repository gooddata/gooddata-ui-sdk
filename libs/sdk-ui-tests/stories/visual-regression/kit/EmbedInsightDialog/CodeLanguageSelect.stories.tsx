// (C) 2022-2025 GoodData Corporation
import { useState } from "react";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/internal";
import { CodeLanguageSelect, CodeLanguageType } from "@gooddata/sdk-ui-kit";

import { wrapWithTheme } from "../../themeWrapper.js";

function CodeLanguageSelectorExamples() {
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
}

export default {
    title: "12 UI Kit/EmbedInsightDialog/CodeLanguageSelect",
};

export const FullFeatured = () => <CodeLanguageSelectorExamples />;
FullFeatured.parameters = { kind: "full-featured", screenshot: true };

export const Themed = () => wrapWithTheme(<CodeLanguageSelectorExamples />);
Themed.parameters = { kind: "themed", screenshot: true };
