// (C) 2023-2025 GoodData Corporation

import { useState } from "react";

import { ILocale } from "@gooddata/sdk-ui";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/internal";
import { LocaleSetting } from "@gooddata/sdk-ui-kit";

import { IStoryParameters } from "../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../themeWrapper.js";

function LocaleSettingExample() {
    const [isLocaleActive, setIsLocalActive] = useState(false);
    const [selectedLocale, setSelectedLocale] = useState<ILocale>("en-US");
    return (
        <InternalIntlWrapper>
            <div className="screenshot-target library-component">
                <LocaleSetting
                    isChecked={isLocaleActive}
                    onChecked={() => setIsLocalActive(!isLocaleActive)}
                    selectedLocal={selectedLocale}
                    onLocaleSelected={(locale) => setSelectedLocale(locale)}
                />
            </div>
        </InternalIntlWrapper>
    );
}

// eslint-disable-next-line no-restricted-exports
export default {
    title: "12 UI Kit/EmbedInsightDialog/LocaleSetting",
};

export function FullFeatured() {
    return <LocaleSettingExample />;
}
FullFeatured.parameters = { kind: "full-featured", screenshot: true } satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<LocaleSettingExample />);
Themed.parameters = { kind: "themed", screenshot: true } satisfies IStoryParameters;
