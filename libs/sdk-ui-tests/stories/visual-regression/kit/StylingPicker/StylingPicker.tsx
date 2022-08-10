// (C) 2022 GoodData Corporation

import React from "react";
import { idRef, ITheme } from "@gooddata/sdk-model";
import {
    defaultThemeMetadataObject,
    getColorsPreviewFromTheme,
    IStylingPickerItem,
    StylingPicker,
} from "@gooddata/sdk-ui-kit";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/dist/internal/utils/internalIntlProvider";
import { action } from "@storybook/addon-actions";
import { storiesOf } from "../../../_infra/storyRepository";
import { UiKit } from "../../../_infra/storyGroups";
import { wrapWithTheme } from "../../themeWrapper";
import { customThemeItems } from "./itemsMock";

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

const StylingPickerTest: React.FC = () => {
    return (
        <InternalIntlWrapper>
            <div style={{ width: "600px" }}>
                <div className="library-component screenshot-target">
                    <StylingPicker
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
                    <StylingPicker
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
                    <StylingPicker
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

storiesOf(`${UiKit}/StylingPicker`)
    .add("full-featured", () => <StylingPickerTest />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<StylingPickerTest />), { screenshot: true });
