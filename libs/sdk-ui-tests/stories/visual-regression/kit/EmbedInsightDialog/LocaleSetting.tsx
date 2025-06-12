// (C) 2023 GoodData Corporation
import React, { useState } from "react";
import { LocaleSetting } from "@gooddata/sdk-ui-kit";
import { ILocale } from "@gooddata/sdk-ui";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/internal";

import { storiesOf } from "../../../_infra/storyRepository.js";
import { UiKit } from "../../../_infra/storyGroups.js";
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

storiesOf(`${UiKit}/EmbedInsightDialog/LocaleSetting`)
    .add("full-featured", () => <LocaleSettingExample />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<LocaleSettingExample />), { screenshot: true });
