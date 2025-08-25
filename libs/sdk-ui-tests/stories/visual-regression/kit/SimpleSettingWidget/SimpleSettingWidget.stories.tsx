// (C) 2022-2025 GoodData Corporation
import React from "react";

import { SimpleSettingWidget } from "@gooddata/sdk-ui-kit";

import { wrapWithTheme } from "../../themeWrapper.js";

function SimpleSettingWidgetTest() {
    return (
        <div style={{ maxWidth: "600px" }}>
            <div className="library-component screenshot-target">
                <SimpleSettingWidget
                    onSubmit={() => {}}
                    isLoading={false}
                    title={"White-labeling"}
                    currentSettingStatus={"Disabled"}
                    titleTooltip={"Remove branding elements in the GoodData Portal"}
                    helpLinkText={"What is white-labeled?"}
                    helpLinkUrl="/"
                    actionButtonText={"Enable"}
                    onHelpLinkClick={() => {}}
                />
            </div>
            <div className="library-component screenshot-target">
                <SimpleSettingWidget
                    onSubmit={() => {}}
                    isLoading={true}
                    title={"Component title"}
                    currentSettingStatus={"Status"}
                    titleTooltip={"Tooltip"}
                    helpLinkText={"Documentation"}
                    helpLinkUrl="/"
                    actionButtonText={"Submit"}
                    onHelpLinkClick={() => {}}
                />
            </div>
        </div>
    );
}

export default {
    title: "12 UI Kit/SimpleSettingWidget",
};

export function FullFeatured() {
    return <SimpleSettingWidgetTest />;
}
FullFeatured.parameters = { kind: "full-featured", screenshot: true };

export const Themed = () => wrapWithTheme(<SimpleSettingWidgetTest />);
Themed.parameters = { kind: "themed", screenshot: true };
