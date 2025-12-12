// (C) 2024-2025 GoodData Corporation

import { type MessageDescriptor, defineMessages } from "react-intl";

import { useEventToastMessage } from "../../../../_staging/sharedHooks/useEventToastMessage.js";
import {
    type DashboardFilterViewDefaultStatusChangeFailed,
    type DashboardFilterViewDefaultStatusChangeSucceeded,
    isDashboardFilterViewApplicationFailed,
    isDashboardFilterViewApplicationSucceeded,
    isDashboardFilterViewCreationFailed,
    isDashboardFilterViewCreationSucceeded,
    isDashboardFilterViewDefaultStatusChangeFailed,
    isDashboardFilterViewDefaultStatusChangeSucceeded,
    isDashboardFilterViewDeletionFailed,
    isDashboardFilterViewDeletionSucceeded,
} from "../../../../model/index.js";

const messages: Record<string, MessageDescriptor> = defineMessages({
    creationSuccess: { id: "filters.filterViews.toast.viewSaved" },
    creationFailure: { id: "filters.filterViews.toast.viewNotSaved" },
    deletionSuccess: { id: "filters.filterViews.toast.viewDeleted" },
    deletionFailure: { id: "filters.filterViews.toast.viewNotDeleted" },
    applicationSuccess: { id: "filters.filterViews.toast.viewApplied" },
    applicationFailure: { id: "filters.filterViews.toast.viewNotApplied" },
    setAsDefaultSuccess: { id: "filters.filterViews.toast.viewSetAsDefault" },
    setAsDefaultFailure: { id: "filters.filterViews.toast.viewNotSetAsDefault" },
    unsetAsDefaultSuccess: { id: "filters.filterViews.toast.viewUnsetAsDefault" },
    unsetAsDefaultFailure: { id: "filters.filterViews.toast.viewNotUnsetAsDefault" },
});

const getChangeDefaultStatusSucceededMessage = (cmd: DashboardFilterViewDefaultStatusChangeSucceeded) =>
    cmd.payload.filterView.isDefault ? messages["setAsDefaultSuccess"] : messages["unsetAsDefaultSuccess"];

const getChangeDefaultStatusFailedMessage = (cmd: DashboardFilterViewDefaultStatusChangeFailed) =>
    cmd.payload.filterView.isDefault ? messages["unsetAsDefaultFailure"] : messages["setAsDefaultFailure"];

// this hook handles pushing of toast messages to the message context based on emitted events that are
// the results of the commands dispatched from the component that uses this hook
export const useFilterViewsToastMessages = () => {
    useEventToastMessage("success", isDashboardFilterViewCreationSucceeded, messages["creationSuccess"]);
    useEventToastMessage("error", isDashboardFilterViewCreationFailed, messages["creationFailure"]);
    useEventToastMessage("success", isDashboardFilterViewDeletionSucceeded, messages["deletionSuccess"]);
    useEventToastMessage("error", isDashboardFilterViewDeletionFailed, messages["deletionFailure"]);
    useEventToastMessage(
        "success",
        isDashboardFilterViewApplicationSucceeded,
        messages["applicationSuccess"],
    );
    useEventToastMessage("error", isDashboardFilterViewApplicationFailed, messages["applicationFailure"]);
    useEventToastMessage<DashboardFilterViewDefaultStatusChangeSucceeded>(
        "success",
        isDashboardFilterViewDefaultStatusChangeSucceeded,
        getChangeDefaultStatusSucceededMessage,
    );
    useEventToastMessage<DashboardFilterViewDefaultStatusChangeFailed>(
        "error",
        isDashboardFilterViewDefaultStatusChangeFailed,
        getChangeDefaultStatusFailedMessage,
    );
};
