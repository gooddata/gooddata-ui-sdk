// (C) 2022-2025 GoodData Corporation

import { useState } from "react";

import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/internal";
import { CodeLanguageSelect, type CodeLanguageType } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../../_infra/backstopScenario.js";
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

// eslint-disable-next-line no-restricted-exports
export default {
    title: "12 UI Kit/EmbedInsightDialog/CodeLanguageSelect",
};

export function FullFeatured() {
    return <CodeLanguageSelectorExamples />;
}
FullFeatured.parameters = {
    kind: "full-featured",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<CodeLanguageSelectorExamples />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
