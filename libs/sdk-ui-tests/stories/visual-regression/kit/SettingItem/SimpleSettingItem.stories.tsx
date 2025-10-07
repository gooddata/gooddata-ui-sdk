// (C) 2022-2025 GoodData Corporation

import { Bubble, BubbleHoverTrigger, SettingItem } from "@gooddata/sdk-ui-kit";

import { wrapWithTheme } from "../../themeWrapper.js";

function SettingItemTest() {
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
                    isDisableAction
                    actionTooltipText="Tooltip Action text"
                    hasDivider
                    onAction={() => {}}
                />
                <SettingItem
                    title="Switcher"
                    titleTooltipText={"Title Tooltip Text"}
                    value="Current Value"
                    actionType={"Switcher"}
                    actionValue
                    onAction={() => {}}
                />

                <SettingItem
                    title="With subtitle"
                    titleTooltipText={"Title Tooltip Text"}
                    value="Current Value"
                    actionType={"Switcher"}
                    actionValue
                    onAction={() => {}}
                    renderSubtitle={() => (
                        <BubbleHoverTrigger>
                            <span className="gd-setting-widget-status-pill" style={{ marginLeft: "10px" }}>
                                Restricted
                            </span>
                            <Bubble className="bubble-primary" alignPoints={[{ align: "cr cl" }]}>
                                Subheader tooltip!
                            </Bubble>
                        </BubbleHoverTrigger>
                    )}
                />
            </div>
        </div>
    );
}

export default {
    title: "12 UI Kit/SettingItem",
};

export function FullFeatured() {
    return <SettingItemTest />;
}
FullFeatured.parameters = { kind: "full-featured", screenshot: true };

export const Themed = () => wrapWithTheme(<SettingItemTest />);
Themed.parameters = { kind: "themed", screenshot: true };
