// (C) 2020-2026 GoodData Corporation

import {
    type FocusEvent,
    type RefObject,
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { defineMessage, useIntl } from "react-intl";

import { ConfirmDialog, Input, Message, Typography } from "@gooddata/sdk-ui-kit";
import { _compact } from "@gooddata/util";

import { DEFAULT_MENU_BUTTON_ID } from "../../../_staging/accessibility/elementId.js";
import {
    DASHBOARD_TITLE_MAX_LENGTH,
    truncateDashboardTitle,
} from "../../../_staging/dashboard/dashboardTitle.js";
import { messages } from "../../../locales.js";
import { IntlWrapper } from "../../localization/IntlWrapper.js";

const defaultTitleMessage = defineMessage({ id: "dialogs.save.as.new.default.title" });

/**
 * The dialog is usually opened from a menu item that is gone once the dialog closes.
 * Return the focus to the element that opened the dialog while it is still on the page,
 * otherwise to the dashboard "More actions" menu button, so the focus is never lost.
 */
function useReturnFocusTo(): RefObject<HTMLElement | null> {
    const [opener] = useState(() =>
        typeof document === "undefined" ? null : (document.activeElement as HTMLElement | null),
    );

    return useMemo(
        () => ({
            get current(): HTMLElement | null {
                if (opener && opener !== document.body && opener.isConnected) {
                    return opener;
                }
                return document.getElementById(DEFAULT_MENU_BUTTON_ID);
            },
        }),
        [opener],
    );
}

export interface ISaveAsDialogRendererOwnProps {
    dashboardTitle: string;
    isDashboardSaving: boolean;
    isDashboardLoaded: boolean;
    isKpiWidgetEnabled: boolean;
    isInEditMode: boolean;
    /**
     * The last save failed. The dialog stays open, shows the error and keeps the focus.
     */
    hasSaveError?: boolean;
    locale?: string;

    onSubmit: (title: string, switchToCopy?: boolean, useOriginalFilterContext?: boolean) => void;
    onCancel?: () => void;
}

/**
 * @internal
 */
export const SaveAsNewDashboardDialog = memo(function SaveAsNewDashboardDialog({
    onCancel = () => {},
    isDashboardLoaded,
    isDashboardSaving,
    dashboardTitle: dashboardTitleProp,
    onSubmit,
    isInEditMode,
    isKpiWidgetEnabled,
    hasSaveError = false,
}: ISaveAsDialogRendererOwnProps) {
    const intl = useIntl();
    const returnFocusTo = useReturnFocusTo();
    const titleContainerRef = useRef<HTMLDivElement>(null);

    // keep the user in the dialog after a failed save, on the field to fix
    useEffect(() => {
        if (hasSaveError) {
            titleContainerRef.current?.querySelector("input")?.focus();
        }
    }, [hasSaveError]);

    const getDefaultDashboardTitle = useCallback(() => {
        // shorten only the original title so the localized "Copy of" text stays whole
        const affixLength = intl.formatMessage(defaultTitleMessage, { title: "" }).length;
        return intl.formatMessage(defaultTitleMessage, {
            title: truncateDashboardTitle(dashboardTitleProp, DASHBOARD_TITLE_MAX_LENGTH - affixLength),
        });
    }, [dashboardTitleProp, intl]);

    const [dashboardTitle, setDashboardTitle] = useState(getDefaultDashboardTitle());

    const canCreateDashboard = useCallback(() => {
        return isDashboardLoaded && !isDashboardSaving;
    }, [isDashboardLoaded, isDashboardSaving]);

    const handleTitleFocus = useCallback((e: FocusEvent<HTMLInputElement>) => {
        e.target.select();
    }, []);

    const handleTitleBlur = useCallback(
        (e: FocusEvent<HTMLInputElement>) => {
            const newDashboardTitle = e.target.value.trim();
            setDashboardTitle(newDashboardTitle === "" ? getDefaultDashboardTitle() : newDashboardTitle);
        },
        [getDefaultDashboardTitle],
    );

    const handleTitleChange = (value: string) => {
        setDashboardTitle(value);
    };

    const onSubmitHandler = useCallback(() => {
        const title = dashboardTitle.trim();
        if (canCreateDashboard() && title !== "") {
            onSubmit(
                title,
                true, // switch to the new dashboard
                // do not reuse the filter context in edit mode, create a new one with the current filter state
                // otherwise use the original filter context values when creating a copy
                !isInEditMode,
            );
        }
    }, [canCreateDashboard, dashboardTitle, isInEditMode, onSubmit]);

    const getNoteText = useCallback(() => {
        const messageId = _compact([isKpiWidgetEnabled && messages.saveAsNewAlertsMessage.id]).at(0);

        return messageId ? intl.formatMessage({ id: messageId }) : "";
    }, [intl, isKpiWidgetEnabled]);

    const noteText = getNoteText();

    return (
        <ConfirmDialog
            onCancel={onCancel}
            onSubmit={onSubmitHandler}
            isPositive
            className="s-dialog save-as-new-dialog"
            headline={intl.formatMessage({ id: "dialogs.save.as.new.title" })}
            cancelButtonText={intl.formatMessage({ id: "cancel" })}
            submitButtonText={intl.formatMessage({ id: "create.dashboard" })}
            isSubmitDisabled={isDashboardSaving || dashboardTitle.trim() === ""}
            returnFocusTo={returnFocusTo}
        >
            <Typography tagName="p" className="dashboard-note">
                {intl.formatMessage({ id: "dialogs.save.as.new.desc" })}
            </Typography>
            {/* the error is announced by the toast; this is the visible text that stays in the dialog */}
            {hasSaveError ? (
                <Message type="error" className="s-save-as-new-error">
                    {intl.formatMessage(messages.messagesDashboardSaveFailed)}
                </Message>
            ) : null}
            <div className="dashboard-title" ref={titleContainerRef}>
                <Input
                    autofocus
                    maxlength={DASHBOARD_TITLE_MAX_LENGTH}
                    onFocus={handleTitleFocus}
                    onBlur={handleTitleBlur}
                    value={dashboardTitle}
                    placeholder={getDefaultDashboardTitle()}
                    onChange={handleTitleChange as any}
                />
            </div>
            {noteText ? <Message type="progress">{noteText}</Message> : null}
        </ConfirmDialog>
    );
});

export const SaveAsDialogRendererIntl = SaveAsNewDashboardDialog;

export function SaveAsDialogRenderer(props: ISaveAsDialogRendererOwnProps) {
    return (
        <IntlWrapper locale={props.locale}>
            <SaveAsDialogRendererIntl {...props} />
        </IntlWrapper>
    );
}
