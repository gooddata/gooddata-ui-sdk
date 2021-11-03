// (C) 2021 GoodData Corporation
import React from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { Button } from "@gooddata/sdk-ui-kit";

import { IShareButtonProps } from "./types";
import { ShareButtonPropsProvider, useShareButtonProps } from "./ShareButtonPropsContext";
import {
    selectCanManageACL,
    selectSettings,
    useDashboardSelector,
    selectDashboardShareStatus,
} from "../../../model";

import { HiddenShareButton } from "./HiddenShareButton";
import { IShareProps } from "../../../types";

const DefaultShareButtonCore: React.FC<WrappedComponentProps> = ({ intl }): JSX.Element | null => {
    const { onShareButtonClick } = useShareButtonProps();
    const settings = useDashboardSelector(selectSettings);
    const hasPermission = useDashboardSelector(selectCanManageACL);
    // TODO INE temp switching of share status. Will be replaced by Share dialog in TNT-257
    // TODO INE remove this hardcoded switching of isUnderStrictControl in TNT-292
    const currentShareStatus = useDashboardSelector(selectDashboardShareStatus);
    const newShareProps: IShareProps =
        currentShareStatus === "private"
            ? {
                  shareStatus: "public",
                  isUnderStrictControl: false,
              }
            : {
                  shareStatus: "private",
                  isUnderStrictControl: true,
              };

    if (settings.enableAnalyticalDashboardPermissions && hasPermission) {
        return (
            <>
                <Button
                    onClick={() => onShareButtonClick(newShareProps)}
                    value={
                        currentShareStatus === "private"
                            ? intl.formatMessage({ id: "share.button.text" })
                            : "UNSHARE"
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
 * @internal
 */
export const DefaultShareButtonInner = injectIntl(DefaultShareButtonCore);

/**
 * @alpha
 */
export const DefaultShareButton = (props: IShareButtonProps): JSX.Element => {
    return (
        <ShareButtonPropsProvider {...props}>
            <DefaultShareButtonInner />
        </ShareButtonPropsProvider>
    );
};
