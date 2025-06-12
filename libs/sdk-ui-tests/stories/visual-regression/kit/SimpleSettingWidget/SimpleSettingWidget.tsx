// (C) 2022 GoodData Corporation
import React from "react";
import { storiesOf } from "../../../_infra/storyRepository.js";
import { UiKit } from "../../../_infra/storyGroups.js";
import { wrapWithTheme } from "../../themeWrapper.js";
import { SimpleSettingWidget } from "@gooddata/sdk-ui-kit";

const SimpleSettingWidgetTest = () => {
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
};

storiesOf(`${UiKit}/SimpleSettingWidget`)
    .add("full-featured", () => <SimpleSettingWidgetTest />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<SimpleSettingWidgetTest />), { screenshot: true });
