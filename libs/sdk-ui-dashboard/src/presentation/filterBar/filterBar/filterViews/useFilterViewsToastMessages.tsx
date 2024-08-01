// (C) 2024 GoodData Corporation

import { useEffect } from "react";
import { defineMessages, MessageDescriptor } from "react-intl";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import {
    useDashboardEventsContext,
    DashboardEventHandler,
    isDashboardFilterViewCreationSucceeded,
    isDashboardFilterViewCreationFailed,
    isDashboardFilterViewDeletionSucceeded,
    isDashboardFilterViewDeletionFailed,
    isDashboardFilterViewApplicationSucceeded,
    isDashboardFilterViewApplicationFailed,
    isDashboardFilterViewSetAsDefaultSucceeded,
    isDashboardFilterViewSetAsDefaultFailed,
    DashboardFilterViewSetAsDefaultSucceeded,
    DashboardFilterViewSetAsDefaultFailed,
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

// this hook handles pushing of toast messages to the message context based on emitted events that are
// the results of the commands dispatched from the component that uses this hook
export const useFilterViewsToastMessages = () => {
    const { registerHandler, unregisterHandler } = useDashboardEventsContext();
    const { addSuccess, addWarning, addError } = useToastMessage();

    // display toast messages with results of the async dispatched commands
    useEffect(() => {
        const onCreationSucceeded: DashboardEventHandler = {
            eval: (evt: unknown) => isDashboardFilterViewCreationSucceeded(evt),
            handler: () => addSuccess(messages.creationSuccess),
        };
        const onCreationFailed: DashboardEventHandler = {
            eval: (evt: unknown) => isDashboardFilterViewCreationFailed(evt),
            handler: () => addError(messages.creationFailure),
        };
        const onDeletionSucceeded: DashboardEventHandler = {
            eval: (evt: unknown) => isDashboardFilterViewDeletionSucceeded(evt),
            handler: () => addSuccess(messages.deletionSuccess),
        };
        const onDeletionFailed: DashboardEventHandler = {
            eval: (evt: unknown) => isDashboardFilterViewDeletionFailed(evt),
            handler: () => addError(messages.deletionFailure),
        };
        const onApplicationSucceeded: DashboardEventHandler = {
            eval: (evt: unknown) => isDashboardFilterViewApplicationSucceeded(evt),
            handler: () => addSuccess(messages.applicationSuccess),
        };
        const onApplicationFailed: DashboardEventHandler = {
            eval: (evt: unknown) => isDashboardFilterViewApplicationFailed(evt),
            handler: () => addError(messages.applicationFailure),
        };
        const onSetAsDefaultSucceeded: DashboardEventHandler = {
            eval: (evt: unknown) => isDashboardFilterViewSetAsDefaultSucceeded(evt),
            handler: (cmd: DashboardFilterViewSetAsDefaultSucceeded) =>
                addSuccess(
                    cmd.payload.filterView.isDefault
                        ? messages.unsetAsDefaultSuccess
                        : messages.setAsDefaultSuccess,
                ),
        };
        const onSetAsDefaultFailed: DashboardEventHandler = {
            eval: (evt: unknown) => isDashboardFilterViewSetAsDefaultFailed(evt),
            handler: (cmd: DashboardFilterViewSetAsDefaultFailed) =>
                addError(
                    cmd.payload.filterView.isDefault
                        ? messages.unsetAsDefaultFailure
                        : messages.setAsDefaultFailure,
                ),
        };

        registerHandler(onCreationSucceeded);
        registerHandler(onCreationFailed);
        registerHandler(onDeletionSucceeded);
        registerHandler(onDeletionFailed);
        registerHandler(onApplicationSucceeded);
        registerHandler(onApplicationFailed);
        registerHandler(onSetAsDefaultSucceeded);
        registerHandler(onSetAsDefaultFailed);

        return () => {
            unregisterHandler(onCreationSucceeded);
            unregisterHandler(onCreationFailed);
            unregisterHandler(onDeletionSucceeded);
            unregisterHandler(onDeletionFailed);
            unregisterHandler(onApplicationSucceeded);
            unregisterHandler(onApplicationFailed);
            unregisterHandler(onSetAsDefaultSucceeded);
            unregisterHandler(onSetAsDefaultFailed);
        };
    }, [registerHandler, unregisterHandler, addSuccess, addWarning, addError]);
};
