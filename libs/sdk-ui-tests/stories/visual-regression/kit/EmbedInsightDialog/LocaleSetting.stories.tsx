// (C) 2023-2025 GoodData Corporation
import React, { useState } from "react";

import { ILocale } from "@gooddata/sdk-ui";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/internal";
import { LocaleSetting } from "@gooddata/sdk-ui-kit";

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

export default {
    title: "12 UI Kit/EmbedInsightDialog/LocaleSetting",
};

export function FullFeatured() {
    return <LocaleSettingExample />;
}
FullFeatured.parameters = { kind: "full-featured", screenshot: true };

export const Themed = () => wrapWithTheme(<LocaleSettingExample />);
Themed.parameters = { kind: "themed", screenshot: true };
