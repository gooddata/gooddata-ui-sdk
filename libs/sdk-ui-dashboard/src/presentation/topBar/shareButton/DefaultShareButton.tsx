// (C) 2021 GoodData Corporation
import React from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { Button } from "@gooddata/sdk-ui-kit";

import { IShareButtonProps } from "./types";
import {
    selectCanManageACL,
    selectSettings,
    useDashboardSelector,
    selectDashboardShareStatus,
    selectBackendCapabilities,
} from "../../../model";

import { HiddenShareButton } from "./HiddenShareButton";

const DefaultShareButtonCore: React.FC<IShareButtonProps & WrappedComponentProps> = ({
    intl,
    onShareButtonClick,
}): JSX.Element | null => {
    const settings = useDashboardSelector(selectSettings);
    const capabilities = useDashboardSelector(selectBackendCapabilities);
    const hasPermission = useDashboardSelector(selectCanManageACL);
    const currentShareStatus = useDashboardSelector(selectDashboardShareStatus);

    if (
        settings.enableAnalyticalDashboardPermissions &&
        capabilities.supportsAccessControl &&
        hasPermission
    ) {
        return (
            <>
                <Button
                    onClick={() => onShareButtonClick()}
                    value={
                        currentShareStatus === "private"
                            ? intl.formatMessage({ id: "share.button.text" })
                            : "UNSHARE" // TODO INE temp switching of label. Will be replaced by status icons TNT-277
                    }
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
