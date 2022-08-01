// (C) 2022 GoodData Corporation

import React from "react";
import { idRef } from "@gooddata/sdk-model";
import { defaultThemeMetadataObject, StylingPicker } from "@gooddata/sdk-ui-kit";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/dist/internal/utils/internalIntlProvider";
import { action } from "@storybook/addon-actions";
import { storiesOf } from "../../../_infra/storyRepository";
import { UiKit } from "../../../_infra/storyGroups";
import { wrapWithTheme } from "../../themeWrapper";
import { customThemeItems } from "./itemsMock";

const emptyMessageElement = (
    <div>
        There are no custom themes.
        <br />
        Create one now.
    </div>
);
const footerHelpLink = "https://gooddata.com";
const footerHelpTitle = "How to create a custom theme?";
const footerMessage = "To create theme please use your computer.";

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
                        emptyMessageElement={emptyMessageElement}
                        basicItem={defaultThemeMetadataObject}
                        customItems={customThemeItems}
                        selectedItemRef={idRef("theme2")}
                        onApply={action("onApply")}
                        onListActionClick={action("onListActionClick")}
                    />
                </div>
                <div className="library-component screenshot-target">
                    <StylingPicker
                        title="Fewer list items"
                        footerHelpLink={footerHelpLink}
                        footerHelpTitle={footerHelpTitle}
                        footerMobileMessage={footerMessage}
                        emptyMessageElement={emptyMessageElement}
                        basicItem={defaultThemeMetadataObject}
                        customItems={customThemeItems.slice(0, 2)}
                        onApply={action("onApply")}
                        onListActionClick={action("onListActionClick")}
                    />
                </div>
                <div className="library-component screenshot-target">
                    <StylingPicker
                        title="No custom themes"
                        titleTooltip="Theme customize the look of Dashboards and Analytical Designer. Default theme is inherited by all workspaces within the organization. You can select non default theme for individual workspaces through API."
                        footerMobileMessage={footerMessage}
                        emptyMessageElement={emptyMessageElement}
                        basicItem={defaultThemeMetadataObject}
                        customItems={[]}
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
