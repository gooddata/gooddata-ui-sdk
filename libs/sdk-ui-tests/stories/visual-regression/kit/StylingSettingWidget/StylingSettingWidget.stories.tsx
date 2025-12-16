// (C) 2022-2025 GoodData Corporation

import { action } from "storybook/actions";

import { type ITheme, idRef } from "@gooddata/sdk-model";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/internal";
import {
    type IStylingPickerItem,
    StylingSettingWidget,
    defaultThemeMetadataObject,
    getColorsPreviewFromTheme,
} from "@gooddata/sdk-ui-kit";

import { customThemeItems } from "./itemsMock.js";
import { type IStoryParameters, State } from "../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../themeWrapper.js";

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

function StylingSettingWidgetTest() {
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
}

// eslint-disable-next-line no-restricted-exports
export default {
    title: "12 UI Kit/StylingSettingWidget",
};

export function FullFeatured() {
    return <StylingSettingWidgetTest />;
}
FullFeatured.parameters = {
    kind: "full-featured",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<StylingSettingWidgetTest />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
