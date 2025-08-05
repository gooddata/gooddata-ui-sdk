// (C) 2024-2025 GoodData Corporation

import React, { useRef, useCallback } from "react";
import { useIntl } from "react-intl";
import {
    Bubble,
    IAlignPoint,
    useIdPrefixed,
    UiDropdownIconButton,
    UiIconButton,
    UiTooltip,
    Dropdown,
} from "@gooddata/sdk-ui-kit";
import { IDashboardLayout, IDashboardLayoutContainerDirection } from "@gooddata/sdk-model";

import { useDashboardUserInteraction, ExtendedDashboardWidget } from "../../../../model/index.js";
import { getLayoutConfiguration } from "../../../../_staging/dashboard/flexibleLayout/layoutConfiguration.js";

import { LayoutDirectionConfigurationDialog } from "./LayoutDirectionConfigurationDialog.js";

const TOOLBAR_ALIGN_POINTS: IAlignPoint[] = [
    { align: "tr tl", offset: { x: 0, y: 11 } },
    { align: "tl tr", offset: { x: -2, y: 11 } },
];
const ARROW_STYLES = { display: "none" };
const ALIGN_TOOLBAR_TO = ".s-dash-item.is-selected";
const IGNORE_TOOLBAR_CLICKS_ON_BY_CLASS = [ALIGN_TOOLBAR_TO]; // do not close on click to the widget

interface ToolbarProps {
    layout: IDashboardLayout<ExtendedDashboardWidget>;
    onWidgetDelete: () => void;
    onWidgetDirectionChanged: (direction: IDashboardLayoutContainerDirection) => void;
    onToggleHeaders: (areSectionHeadersEnabled: boolean) => void;
    onClose: () => void;
}

const ToggleDirectionButton: React.FC<{
    direction: IDashboardLayoutContainerDirection;
    onWidgetDirectionChanged: (direction: IDashboardLayoutContainerDirection) => void;
}> = ({ direction, onWidgetDirectionChanged }) => {
    const intl = useIntl();
    const userInteraction = useDashboardUserInteraction();
    const directionButtonRef = useRef<HTMLButtonElement>(null);
    const directionConfigurationTriggerId = useIdPrefixed("LayoutDirectionConfigurationTrigger");
    const buttonTooltip =
        direction === "row"
            ? intl.formatMessage({ id: "nestedLayoutToolbar.direction.row.tooltip" })
            : intl.formatMessage({ id: "nestedLayoutToolbar.direction.column.tooltip" });
    return (
        <div>
            <Dropdown
                renderButton={({ isOpen, ariaAttributes, accessibilityConfig, toggleDropdown }) => (
                    <UiTooltip
                        arrowPlacement="bottom"
                        triggerBy={["hover", "focus"]}
                        optimalPlacement={true}
                        content={buttonTooltip}
                        anchor={
                            <UiDropdownIconButton
                                ref={directionButtonRef}
                                icon={direction === "row" ? "directionRow" : "directionColumn"}
                                variant="tertiary"
                                isDropdownOpen={isOpen}
                                dataTestId="nested-layout__button--direction"
                                onClick={() => {
                                    toggleDropdown();
                                    if (isOpen) {
                                        userInteraction.nestedLayoutInteraction(
                                            "nestedLayoutDirectionConfigurationClosed",
                                        );
                                    } else {
                                        userInteraction.nestedLayoutInteraction(
                                            "nestedLayoutDirectionConfigurationOpened",
                                        );
                                    }
                                }}
                                ariaAttributes={ariaAttributes}
                                accessibilityConfig={accessibilityConfig}
                                size="large"
                            />
                        }
                    />
                )}
                renderBody={({ ariaAttributes, closeDropdown }) => (
                    <LayoutDirectionConfigurationDialog
                        ariaAttributes={ariaAttributes}
                        currentDirection={direction}
                        onDirectionChanged={onWidgetDirectionChanged}
                        onClose={() => {
                            closeDropdown();
                            userInteraction.nestedLayoutInteraction(
                                "nestedLayoutDirectionConfigurationClosed",
                            );
                        }}
                        returnFocusToId={directionConfigurationTriggerId}
                        alignTo={directionButtonRef.current}
                    />
                )}
            />
        </div>
    );
};

const ToggleSectionHeaderButton: React.FC<{
    areSectionHeadersEnabled: boolean;
    onToggleHeaders: (areSectionHeadersEnabled: boolean) => void;
}> = ({ areSectionHeadersEnabled, onToggleHeaders }) => {
    const intl = useIntl();
    const tooltipContent = areSectionHeadersEnabled
        ? intl.formatMessage({ id: "nestedLayoutToolbar.hideHeader" })
        : intl.formatMessage({ id: "nestedLayoutToolbar.showHeader" });
    const userInteraction = useDashboardUserInteraction();
    const onButtonClick = useCallback(() => {
        onToggleHeaders(!areSectionHeadersEnabled);
        userInteraction.nestedLayoutInteraction(
            areSectionHeadersEnabled ? "nestedLayoutHeaderDisabled" : "nestedLayoutHeaderEnabled",
        );
    }, [areSectionHeadersEnabled, onToggleHeaders, userInteraction]);
    return (
        <div>
            <UiTooltip
                arrowPlacement="bottom"
                triggerBy={["hover", "focus"]}
                optimalPlacement={true}
                content={tooltipContent}
                anchor={
                    <UiIconButton
                        icon="header"
                        variant="tertiary"
                        size="large"
                        isActive={areSectionHeadersEnabled}
                        dataTestId="s-nested-layout__button--headers"
                        onClick={onButtonClick}
                        label={tooltipContent}
                    />
                }
            />
        </div>
    );
};

const RemoveContainerButton: React.FC<{
    onWidgetDelete: () => void;
}> = ({ onWidgetDelete }) => {
    const userInteraction = useDashboardUserInteraction();
    const onButtonClick = useCallback(() => {
        onWidgetDelete();
        userInteraction.nestedLayoutInteraction("nestedLayoutRemoved");
    }, [onWidgetDelete, userInteraction]);
    const intl = useIntl();
    const tooltipContent = intl.formatMessage({ id: "nestedLayoutToolbar.remove" });
    return (
        <div>
            <UiTooltip
                arrowPlacement="bottom"
                triggerBy={["hover", "focus"]}
                optimalPlacement={true}
                content={tooltipContent}
                anchor={
                    <UiIconButton
                        icon="trash"
                        variant="tertiary"
                        size="large"
                        dataTestId="s-nested-layout__button--remove"
                        onClick={onButtonClick}
                        label={tooltipContent}
                    />
                }
            />
        </div>
    );
};

export const Toolbar: React.FC<ToolbarProps> = ({
    layout,
    onWidgetDelete,
    onWidgetDirectionChanged,
    onToggleHeaders,
    onClose,
}) => {
    const { sections, direction } = getLayoutConfiguration(layout);
    return (
        <Bubble
            className="bubble-light"
            overlayClassName="gd-nested-layout__toolbar s-nested-layout__toolbar"
            alignTo={ALIGN_TOOLBAR_TO}
            alignPoints={TOOLBAR_ALIGN_POINTS}
            closeOnOutsideClick={true}
            closeOnParentScroll={false}
            ignoreClicksOnByClass={IGNORE_TOOLBAR_CLICKS_ON_BY_CLASS}
            arrowStyle={ARROW_STYLES}
            onClose={onClose}
        >
            <ToggleDirectionButton
                direction={direction}
                onWidgetDirectionChanged={onWidgetDirectionChanged}
            />
            <div className="gd-nested-layout__toolbar__delimiter" />
            {layout.sections.length > 0 ? (
                <>
                    <ToggleSectionHeaderButton
                        areSectionHeadersEnabled={sections.areHeadersEnabled}
                        onToggleHeaders={onToggleHeaders}
                    />
                    <div className="gd-nested-layout__toolbar__delimiter" />
                </>
            ) : null}
            <RemoveContainerButton onWidgetDelete={onWidgetDelete} />
        </Bubble>
    );
};
