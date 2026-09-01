// (C) 2026 GoodData Corporation

import { useScheduledEmailDialogContext } from "../../contexts/ScheduledEmailDialogContext.js";

import { useScheduledExportDraft } from "./ScheduledExportDraftContext.js";

/**
 * Whether the draft's selected notification channel delivers in-platform only.
 * The subject and message fields hide for such a channel.
 */
export function useIsInPlatformChannel(): boolean {
    const { notificationChannels } = useScheduledEmailDialogContext();
    const { editedAutomation } = useScheduledExportDraft();
    const selectedChannel = notificationChannels.find(
        (channel) => channel.id === editedAutomation.notificationChannel,
    );
    return selectedChannel?.destinationType === "inPlatform";
}
