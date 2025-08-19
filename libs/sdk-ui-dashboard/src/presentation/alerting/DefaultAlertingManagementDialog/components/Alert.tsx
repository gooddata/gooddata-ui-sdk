// (C) 2022-2025 GoodData Corporation

import React from "react";

import cx from "classnames";
import { defineMessages, useIntl } from "react-intl";

import { IAutomationMetadataObject, isInsightWidget } from "@gooddata/sdk-model";
import {
    Button,
    Dropdown,
    IUiListboxItem,
    Icon,
    SELECT_ITEM_ACTION,
    ShortenedText,
    UiListbox,
    bemFactory,
    separatorStaticItem,
} from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import {
    selectCanManageWorkspace,
    selectCurrentUser,
    selectSeparators,
    selectWidgetByRef,
    useDashboardSelector,
} from "../../../../model/index.js";
import { gdColorNegative, gdColorStateBlank } from "../../../constants/colors.js";
import { useAlertValidation } from "../../DefaultAlertingDialog/hooks/useAlertValidation.js";
import { getSubtitle } from "../../DefaultAlertingDialog/utils/getters.js";

interface IAlertProps {
    onDelete: () => void;
    onEdit: () => void;
    onTogglePause: () => void;
    alert: IAutomationMetadataObject;
    focusedAction?: "dropdown" | "item" | typeof SELECT_ITEM_ACTION;
    isDropdownOpen: boolean;
    onToggleDropdown: ((newState?: boolean) => void) | (() => void);
    listId: string;
    isSubtitleVisible?: boolean;
}

type IDropdownAction = "edit" | "pause" | "delete";

const TEXT_TOOLTIP_ALIGN_POINTS = [
    { align: "tc bc", offset: { x: 0, y: 0 } },
    { align: "bc tc", offset: { x: 0, y: 0 } },
];

const labelMessages = defineMessages({
    delete: { id: "alerting.alert.menu.delete" },
    pause: { id: "alerting.alert.menu.pause" },
    resume: { id: "alerting.alert.menu.resume" },
    edit: { id: "alerting.alert.menu.edit" },
});

const { b, e } = bemFactory("gd-alerts-list-item");

export const Alert: React.FC<IAlertProps> = (props) => {
    const theme = useTheme();

    const {
        alert,
        onDelete,
        onEdit,
        onTogglePause,
        focusedAction,
        isDropdownOpen,
        onToggleDropdown,
        listId,
        isSubtitleVisible,
    } = props;

    const intl = useIntl();
    const { formatMessage } = intl;
    const { isValid } = useAlertValidation(alert);
    const iconColor = theme?.palette?.complementary?.c6 ?? gdColorStateBlank;
    const iconColorError = theme?.palette?.error?.base ?? gdColorNegative;

    const iconActive = <Icon.Alert color={iconColor} />;
    const iconPaused = <Icon.AlertPaused color={iconColor} />;
    const iconError = <Icon.Warning color={iconColorError} />;

    const isPaused = alert.alert?.trigger.state === "PAUSED";

    const editWidgetId = alert.metadata?.widget;
    const editWidgetRef = editWidgetId ? { identifier: editWidgetId } : undefined;

    const widget = useDashboardSelector(selectWidgetByRef(editWidgetRef));
    const insightWidget = isInsightWidget(widget) ? widget : undefined;
    const widgetName = insightWidget?.title ?? "";

    const separators = useDashboardSelector(selectSeparators);
    const subtitle = getSubtitle(intl, widgetName, alert, separators);

    const currentUser = useDashboardSelector(selectCurrentUser);
    const canManageWorkspace = useDashboardSelector(selectCanManageWorkspace);
    const canEdit =
        canManageWorkspace || (currentUser && alert.createdBy && currentUser.login === alert.createdBy.login);

    const items = React.useMemo<IUiListboxItem<IDropdownAction>[]>(() => {
        const deleteItem = {
            type: "interactive" as const,
            id: "delete",
            stringTitle: formatMessage(labelMessages.delete),
            data: "delete" as const,
        };

        return canEdit
            ? [
                  {
                      type: "interactive" as const,
                      id: "edit",
                      stringTitle: formatMessage(labelMessages.edit),
                      data: "edit" as const,
                  },
                  {
                      type: "interactive" as const,
                      id: "pause",
                      stringTitle: formatMessage(isPaused ? labelMessages.resume : labelMessages.pause),
                      data: "pause" as const,
                  },
                  separatorStaticItem,
                  deleteItem,
              ]
            : [deleteItem];
    }, [canEdit, formatMessage, isPaused]);

    const handleAction = React.useCallback(
        (item: (typeof items)[number]) => {
            if (item.type !== "interactive") {
                return;
            }

            // If the action opens a modal, we want to return focus to the list when the modal is closed.
            document.getElementById(listId)?.focus();

            switch (item.data) {
                case "edit":
                    onEdit();
                    break;
                case "pause":
                    onTogglePause();
                    break;
                case "delete":
                    onDelete();
            }
        },
        [listId, onDelete, onEdit, onTogglePause],
    );

    return (
        <div
            className={cx(
                b({
                    readonly: !canEdit,
                    isFocused: !!focusedAction,
                    isFocusedSelectItem: focusedAction === SELECT_ITEM_ACTION || focusedAction === "item",
                    isActive: isDropdownOpen,
                }),
                "s-alert",
            )}
        >
            <div className={e("content")} onClick={canEdit ? onEdit : undefined}>
                <div className={cx(e("icon-container"))}>
                    <div className={cx(e("icon", { invalid: !isValid }))}>
                        {!isValid ? iconError : isPaused ? iconPaused : iconActive}
                    </div>
                </div>
                <div className={e("text-content")}>
                    <div className={e("title")}>
                        <ShortenedText
                            className={e("shortened-text")}
                            tooltipAlignPoints={TEXT_TOOLTIP_ALIGN_POINTS}
                        >
                            {alert.title ?? intl.formatMessage({ id: "dialogs.alerting.title.placeholder" })}
                        </ShortenedText>
                    </div>
                    {isSubtitleVisible ? (
                        <div className={e("subtitle")}>
                            <ShortenedText
                                className={e("shortened-text")}
                                tooltipAlignPoints={TEXT_TOOLTIP_ALIGN_POINTS}
                            >
                                {subtitle}
                            </ShortenedText>
                        </div>
                    ) : null}
                </div>
            </div>
            <Dropdown
                isOpen={isDropdownOpen}
                onToggle={onToggleDropdown}
                className={e("menu")}
                alignPoints={[{ align: "br tr" }, { align: "tr br" }]}
                autofocusOnOpen
                shouldTrapFocus={false}
                returnFocusTo={listId}
                renderButton={({ buttonRef, accessibilityConfig, toggleDropdown, isOpen }) => {
                    return (
                        <Button
                            tabIndex={-1}
                            className={cx(
                                e("menu-icon", { isFocused: focusedAction === "dropdown" && !isOpen }),
                            )}
                            id={`alert-menu-${alert.id}`}
                            ref={buttonRef}
                            onClick={toggleDropdown}
                            accessibilityConfig={accessibilityConfig}
                        >
                            <Icon.Ellipsis />
                        </Button>
                    );
                }}
                renderBody={({ ariaAttributes, closeDropdown }) => {
                    return (
                        <UiListbox
                            items={items}
                            onClose={closeDropdown}
                            shouldCloseOnSelect
                            ariaAttributes={ariaAttributes}
                            onSelect={handleAction}
                        />
                    );
                }}
            />
        </div>
    );
};
