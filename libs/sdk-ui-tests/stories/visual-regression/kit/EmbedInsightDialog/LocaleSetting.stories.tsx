// (C) 2023-2025 GoodData Corporation
import React, { useState } from "react";
import { LocaleSetting } from "@gooddata/sdk-ui-kit";
import { ILocale } from "@gooddata/sdk-ui";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/internal";

import { wrapWithTheme } from "../../themeWrapper.js";

const LocaleSettingExample = () => {
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
};

export default {
    title: "12 UI Kit/EmbedInsightDialog/LocaleSetting",
};

export const FullFeatured = () => <LocaleSettingExample />;
FullFeatured.parameters = { kind: "full-featured", screenshot: true };

export const Themed = () => wrapWithTheme(<LocaleSettingExample />);
Themed.parameters = { kind: "themed", screenshot: true };
