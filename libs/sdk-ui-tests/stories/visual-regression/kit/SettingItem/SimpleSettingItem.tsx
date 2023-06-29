// (C) 2022 GoodData Corporation
import React from "react";
import { SettingItem } from "@gooddata/sdk-ui-kit";

import { storiesOf } from "../../../_infra/storyRepository.js";
import { UiKit } from "../../../_infra/storyGroups.js";
import { wrapWithTheme } from "../../themeWrapper.js";

const SettingItemTest = () => {
    return (
        <div style={{ maxWidth: "941px" }}>
            <div className="library-component screenshot-target">
                <SettingItem
                    title="Link Button"
                    titleTooltipText={"Title Tooltip Text"}
                    value="Current Value"
                    actionType={"LinkButton"}
                    actionValue="Change"
                    onAction={() => {}}
                />
                <SettingItem
                    title="Button - divider"
                    titleTooltipText={"Title Tooltip Text"}
                    value="Current Value"
                    actionType={"Button"}
                    actionValue="Change"
                    isDisableAction={true}
                    actionTooltipText="Tooltip Action text"
                    hasDivider={true}
                    onAction={() => {}}
                />
                <SettingItem
                    title="Switcher"
                    titleTooltipText={"Title Tooltip Text"}
                    value="Current Value"
                    actionType={"Switcher"}
                    actionValue={true}
                    onAction={() => {}}
                />
            </div>
        </div>
    );
};

storiesOf(`${UiKit}/SettingItem`)
    .add("full-featured", () => <SettingItemTest />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<SettingItemTest />), { screenshot: true });
