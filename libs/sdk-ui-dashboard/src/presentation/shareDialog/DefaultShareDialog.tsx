// (C) 2020 GoodData Corporation
import React, { useMemo } from "react";
import { ShareDialog, IShareDialogLabels } from "@gooddata/sdk-ui-kit";
import { IShareDialogProps } from "./types";
import { useIntl } from "react-intl";

/**
 * @alpha
 */
export const DefaultShareDialog = (props: IShareDialogProps): JSX.Element | null => {
    const {
        workspace,
        backend,
        isVisible,
        sharedObject,
        currentUserRef,
        isLockingSupported,
        onApply,
        onCancel,
        onError,
    } = props;

    const intl = useIntl();
    const labels: IShareDialogLabels = useMemo(
        () => ({
            lockControl: intl.formatMessage({ id: "dashboard.shareDialog.lock.label" }),
            underLenientControl: intl.formatMessage({
                id: "dashboard.shareDialog.underLenientControl.label",
            }),
        }),
        [intl],
    );

    if (!isVisible) {
        return null;
    }

    return (
        <ShareDialog
            backend={backend}
            workspace={workspace}
            sharedObject={sharedObject}
            currentUserRef={currentUserRef}
            onApply={onApply}
            onCancel={onCancel}
            onError={onError}
            isLockingSupported={isLockingSupported}
            labels={labels}
        />
    );
};
