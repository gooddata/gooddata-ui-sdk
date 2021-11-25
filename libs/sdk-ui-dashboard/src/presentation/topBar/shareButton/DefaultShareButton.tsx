// (C) 2021 GoodData Corporation
import React from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { Button } from "@gooddata/sdk-ui-kit";

import { IShareButtonProps } from "./types";
import {
    selectCanManageACL,
    selectSettings,
    useDashboardSelector,
    selectBackendCapabilities,
    selectCanManageWorkspace,
    selectDashboardLockStatus,
} from "../../../model";

import { HiddenShareButton } from "./HiddenShareButton";

const DefaultShareButtonCore: React.FC<IShareButtonProps & WrappedComponentProps> = ({
    intl,
    onShareButtonClick,
}): JSX.Element | null => {
    const settings = useDashboardSelector(selectSettings);
    const capabilities = useDashboardSelector(selectBackendCapabilities);
    const hasPermission = useDashboardSelector(selectCanManageACL);
    const isLocked = useDashboardSelector(selectDashboardLockStatus);
    const isAdmin = useDashboardSelector(selectCanManageWorkspace);

    if (
        settings.enableAnalyticalDashboardPermissions &&
        capabilities.supportsAccessControl &&
        hasPermission &&
        (!isLocked || isAdmin)
    ) {
        return (
            <>
                <Button
                    onClick={() => onShareButtonClick()}
                    value={intl.formatMessage({ id: "share.button.text" })}
                    className={
                        "gd-button-secondary dash-header-share-button s-header-share-button gd-button gd-icon-users"
                    }
                />
            </>
        );
    } else {
        return <HiddenShareButton />;
    }
};

/**
 * @alpha
 */
export const DefaultShareButton = injectIntl(DefaultShareButtonCore);
