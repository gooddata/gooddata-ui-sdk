// (C) 2020-2022 GoodData Corporation
import React, { useMemo } from "react";
import { ShareDialog, IShareDialogLabels } from "@gooddata/sdk-ui-kit";
import { IShareDialogProps } from "./types";
import { useIntl } from "react-intl";
import { useDashboardSelector, selectLocale } from "../../model";

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

    const locale = useDashboardSelector(selectLocale);
    const intl = useIntl();
    const labels: IShareDialogLabels = useMemo(
        () => ({
            accessTypeLabel: intl.formatMessage({ id: "dashboard.shareDialog.lock.label" }),
            accessRegimeLabel: intl.formatMessage({
                id: "dashboard.shareDialog.underLenientControl.label",
            }),
            removeAccessCreatorTooltip: intl.formatMessage({
                id: "dashboard.shareDialog.removeAccessCreatorTooltip",
            }),
            removeAccessGranteeTooltip: intl.formatMessage({
                id: "dashboard.shareDialog.removeAccessGranteeTooltip",
            }),
        }),
        [intl],
    );

    if (!isVisible) {
        return null;
    }

    return (
        <ShareDialog
            locale={locale}
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
