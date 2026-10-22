// (C) 2026 GoodData Corporation

import { type ReactNode, useCallback, useMemo, useState } from "react";

import { defineMessages, useIntl } from "react-intl";

import { type IMessage, useMediaQuery } from "@gooddata/sdk-ui-kit";

import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectIsInEditMode } from "../../../model/store/renderMode/renderModeSelectors.js";

const localizationMessages = defineMessages({
    editModeLayoutNote: { id: "messages.dashboard.editModeDesktopLayout.note" },
});

const replacements = {
    b: (chunks: ReactNode) => <b>{chunks}</b>,
};

const EDIT_MODE_LAYOUT_NOTE_MESSAGE_ID = "edit_mode_desktop_layout_note";

// Dismissal lasts until the page reloads and is deliberately never persisted.
let isDismissedInSession = false;

export function useEditModeLayoutNoteMessages() {
    const intl = useIntl();
    const isEditMode = useDashboardSelector(selectIsInEditMode);
    const isNarrowerThanEditModeMinWidth = useMediaQuery("<=lg");
    const [isDismissed, setIsDismissed] = useState(isDismissedInSession);

    const isVisible = isEditMode && isNarrowerThanEditModeMinWidth && !isDismissed;

    const messages = useMemo((): IMessage[] => {
        if (!isVisible) {
            return [];
        }

        return [
            {
                id: EDIT_MODE_LAYOUT_NOTE_MESSAGE_ID,
                type: "progress",
                node: intl.formatMessage(localizationMessages.editModeLayoutNote, replacements),
                createdAt: new Date().getTime(),
                duration: Infinity,
            },
        ] satisfies IMessage[];
    }, [isVisible, intl]);

    // The toasts interop also reports removals caused by the note no longer applying; only a visible note can be dismissed.
    const removeMessage = useCallback(
        (id: string) => {
            if (id === EDIT_MODE_LAYOUT_NOTE_MESSAGE_ID && isVisible) {
                isDismissedInSession = true;
                setIsDismissed(true);
            }
        },
        [isVisible],
    );

    return {
        messages,
        removeMessage,
    };
}
