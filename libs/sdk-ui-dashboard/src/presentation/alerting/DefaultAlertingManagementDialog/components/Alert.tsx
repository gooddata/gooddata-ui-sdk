// (C) 2022-2025 GoodData Corporation

import React from "react";
import { defineMessages, useIntl } from "react-intl";
import cx from "classnames";
import { IAutomationMetadataObject, isInsightWidget } from "@gooddata/sdk-model";

import {
    Button,
    Dropdown,
    Icon,
    IUiListboxItem,
    SELECT_ITEM_ACTION,
    separatorStaticItem,
    ShortenedText,
    UiListbox,
} from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { gdColorNegative, gdColorStateBlank } from "../../../constants/colors.js";
import {
    selectCanManageWorkspace,
    selectCurrentUser,
    selectSeparators,
    selectWidgetByRef,
    useDashboardSelector,
} from "../../../../model/index.js";
import { useAlertValidation } from "../../DefaultAlertingDialog/hooks/useAlertValidation.js";
import { getSubtitle } from "../../DefaultAlertingDialog/utils/getters.js";

interface IAlertProps {
    onDelete: () => void;
    onEdit: () => void;
    onTogglePause: () => void;
    alert: IAutomationMetadataObject;
    focusedAction?: "dropdown" | typeof SELECT_ITEM_ACTION;
    onCloseDropdown?: () => void;
    listId: string;
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

export const Alert: React.FC<IAlertProps> = (props) => {
    const theme = useTheme();

    const { alert, onDelete, onEdit, onTogglePause, focusedAction, onCloseDropdown, listId } = props;

    const intl = useIntl();
    const { formatMessage } = intl;
    const { isValid } = useAlertValidation(alert);
    const iconColor = theme?.palette?.complementary?.c6 ?? gdColorStateBlank;
    const iconColorError = theme?.palette?.error?.base ?? gdColorNegative;

    const iconActive = <Icon.Alert width={16} height={16} color={iconColor} />;
    const iconPaused = <Icon.AlertPaused width={16} height={16} color={iconColor} />;
    const iconError = <Icon.Warning width={16} height={16} color={iconColorError} />;

    const isPaused = alert.alert?.trigger.state === "PAUSED";

    const editWidgetId = alert.metadata?.widget;
    const editWidgetRef = editWidgetId ? { identifier: editWidgetId } : undefined;

    const widget = useDashboardSelector(selectWidgetByRef(editWidgetRef));
    const insightWidget = isInsightWidget(widget) ? widget : undefined;
    const widgetName = insightWidget?.title ?? "";

    const separators = useDashboardSelector(selectSeparators);
    const subtitle = getSubtitle(intl, widgetName, alert, separators);

    const [isDropdownClickedOpen, setIsDropdownClickedOpen] = React.useState(false);
    const isDropdownOpen = isDropdownClickedOpen || focusedAction === "dropdown";

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

    const handleToggleDropdown = React.useCallback(
        (desiredState?: boolean) => {
            setIsDropdownClickedOpen((oldState) => {
                const newState = desiredState ?? !oldState;

                if (!newState) {
                    onCloseDropdown?.();
                }

                return newState;
            });
        },
        [onCloseDropdown],
    );

    const handleAction = React.useCallback(
        (item: typeof items[number]) => {
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
            className={cx("gd-notifications-channel", "s-alert", {
                editable: false,
                hover: isDropdownOpen,
                "gd-notifications-channel--isFocused": !!focusedAction,
                "gd-notifications-channel--isFocusedSelectItem": focusedAction === SELECT_ITEM_ACTION,
            })}
        >
            <div className="gd-notifications-channel-content" onClick={canEdit ? onEdit : undefined}>
                <div
                    className={cx("gd-notifications-channel-icon", {
                        "gd-notifications-channel-icon-invalid": !isValid,
                    })}
                >
                    {!isValid ? iconError : isPaused ? iconPaused : iconActive}
                </div>
                <div className="gd-notifications-channel-text-content">
                    <div className="gd-notifications-channel-title">
                        <strong>
                            <ShortenedText
                                className="gd-notifications-channel-shortened-text"
                                tooltipAlignPoints={TEXT_TOOLTIP_ALIGN_POINTS}
                            >
                                {alert.title ??
                                    intl.formatMessage({ id: "dialogs.alerting.title.placeholder" })}
                            </ShortenedText>
                        </strong>
                    </div>
                    <div>
                        <span className="gd-notifications-channel-subtitle">
                            <ShortenedText
                                className="gd-notifications-channel-shortened-text"
                                tooltipAlignPoints={TEXT_TOOLTIP_ALIGN_POINTS}
                            >
                                {subtitle}
                            </ShortenedText>
                        </span>
                    </div>
                </div>
            </div>
            <Dropdown
                isOpen={isDropdownOpen}
                onToggle={handleToggleDropdown}
                className={"gd-notifications-channel-menu"}
                alignPoints={[{ align: "br tr" }, { align: "tr br" }]}
                autofocusOnOpen
                returnFocusTo={listId}
                renderButton={({ buttonRef, accessibilityConfig, toggleDropdown }) => {
                    return (
                        <Button
                            tabIndex={-1}
                            className="gd-notifications-channel-menu-icon s-alert-menu-icon"
                            id={`alert-menu-${alert.id}`}
                            ref={buttonRef}
                            onClick={toggleDropdown}
                            accessibilityConfig={accessibilityConfig}
                        />
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
