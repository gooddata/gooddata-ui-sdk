// (C) 2022 GoodData Corporation

import React from "react";
import { idRef, ITheme } from "@gooddata/sdk-model";
import {
    defaultThemeMetadataObject,
    getColorsPreviewFromTheme,
    IStylingPickerItem,
    StylingSettingWidget,
} from "@gooddata/sdk-ui-kit";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/internal";
import { action } from "@storybook/addon-actions";
import { storiesOf } from "../../../_infra/storyRepository.js";
import { UiKit } from "../../../_infra/storyGroups.js";
import { wrapWithTheme } from "../../themeWrapper.js";
import { customThemeItems } from "./itemsMock.js";

const emptyMessage = () => (
    <div>
        There are no custom themes.
        <br />
        Create one now.
    </div>
);
const footerHelpLink = "https://gooddata.com";
const footerHelpTitle = "How to create a custom theme?";
const footerMessage = "To create theme please use your computer.";
const defaultItem: IStylingPickerItem<ITheme> = {
    ref: defaultThemeMetadataObject.ref,
    content: defaultThemeMetadataObject.theme,
    name: defaultThemeMetadataObject.title,
};

const StylingSettingWidgetTest: React.FC = () => {
    return (
        <InternalIntlWrapper>
            <div style={{ maxWidth: "580px" }}>
                <div className="library-component screenshot-target">
                    <StylingSettingWidget
                        title="Theme picker"
                        titleTooltip="Theme customize the look of Dashboards and Analytical Designer. Default theme is inherited by all workspaces within the organization. You can select non default theme for individual workspaces through API."
                        footerHelpLink={footerHelpLink}
                        footerHelpTitle={footerHelpTitle}
                        footerMobileMessage={footerMessage}
                        emptyMessage={emptyMessage}
                        defaultItem={defaultItem}
                        customItems={customThemeItems}
                        itemToColorPreview={getColorsPreviewFromTheme}
                        selectedItemRef={idRef("theme2")}
                        onApply={action("onApply")}
                        onListActionClick={action("onListActionClick")}
                        onItemEdit={action("onItemEdit")}
                        onItemDelete={action("onItemDelete")}
                    />
                </div>
                <div className="library-component screenshot-target">
                    <StylingSettingWidget
                        title="Fewer list items"
                        footerHelpLink={footerHelpLink}
                        footerHelpTitle={footerHelpTitle}
                        footerMobileMessage={footerMessage}
                        emptyMessage={emptyMessage}
                        defaultItem={defaultItem}
                        customItems={customThemeItems.slice(0, 2)}
                        itemToColorPreview={getColorsPreviewFromTheme}
                        onApply={action("onApply")}
                        onListActionClick={action("onListActionClick")}
                        onItemEdit={action("onItemEdit")}
                        onItemDelete={action("onItemDelete")}
                    />
                </div>
                <div className="library-component screenshot-target">
                    <StylingSettingWidget
                        title="No custom themes"
                        titleTooltip="Theme customize the look of Dashboards and Analytical Designer. Default theme is inherited by all workspaces within the organization. You can select non default theme for individual workspaces through API."
                        footerMobileMessage={footerMessage}
                        emptyMessage={emptyMessage}
                        defaultItem={defaultItem}
                        customItems={[]}
                        itemToColorPreview={getColorsPreviewFromTheme}
                        onApply={action("onApply")}
                        onListActionClick={action("onListActionClick")}
                    />
                </div>
            </div>
        </InternalIntlWrapper>
    );
};

storiesOf(`${UiKit}/StylingSettingWidget`)
    .add("full-featured", () => <StylingSettingWidgetTest />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<StylingSettingWidgetTest />), { screenshot: true });
