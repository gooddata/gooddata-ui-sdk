// (C) 2021-2022 GoodData Corporation
import React, { useCallback } from "react";

import {
    renameDashboard,
    selectDashboardShareInfo,
    selectDashboardTitle,
    selectIsExport,
    selectIsReadOnly,
    selectPersistedDashboard,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../model/index.js";
import { ButtonBar, DefaultButtonBar } from "../buttonBar/index.js";
import { DefaultMenuButton, MenuButton, useDefaultMenuItems } from "../menuButton/index.js";
import { Title } from "../title/index.js";
import { ITopBarProps } from "./types.js";
import { HiddenTopBar } from "./HiddenTopBar.js";
import { DefaultLockedStatus, DefaultShareStatus } from "../shareIndicators/index.js";
import {
    useCancelButtonProps,
    useEditButtonProps,
    useSaveAsNewButtonProps,
    useSaveButtonProps,
    useShareButtonProps,
} from "../buttonBar/button/index.js";

/**
 * @alpha
 */
export const useTopBarProps = (): ITopBarProps => {
    const dispatch = useDashboardDispatch();
    const title = useDashboardSelector(selectDashboardTitle);
    const isReadOnly = useDashboardSelector(selectIsReadOnly);
    const shareInfo = useDashboardSelector(selectDashboardShareInfo);
    const persistedDashboard = useDashboardSelector(selectPersistedDashboard);

    const defaultMenuItems = useDefaultMenuItems();

    const shareButtonProps = useShareButtonProps();
    const editButtonProps = useEditButtonProps();
    const cancelButtonProps = useCancelButtonProps();
    const saveButtonProps = useSaveButtonProps();
    const saveAsNewButtonProps = useSaveAsNewButtonProps();

    const onTitleChanged = useCallback(
        (title: string) => {
            dispatch(renameDashboard(title));
        },
        [dispatch],
    );

    return {
        menuButtonProps: { menuItems: defaultMenuItems, DefaultMenuButton: DefaultMenuButton },
        titleProps: {
            title,
            onTitleChanged: isReadOnly ? undefined : onTitleChanged,
        },
        buttonBarProps: {
            shareButtonProps,
            editButtonProps,
            cancelButtonProps,
            saveButtonProps,
            saveAsNewButtonProps,
            DefaultButtonBar: DefaultButtonBar,
        },
        shareStatusProps: {
            shareStatus: shareInfo.shareStatus,
            // new dashboards are considered under strict control as well for the share status purposes
            isUnderStrictControl: !persistedDashboard || !!persistedDashboard.isUnderStrictControl,
        },
        lockedStatusProps: {
            isLocked: !!shareInfo.isLocked,
        },
        DefaultTopBar,
    };
};

const TopBarCore = (props: ITopBarProps): JSX.Element => {
    const { menuButtonProps, titleProps, buttonBarProps, shareStatusProps, lockedStatusProps } = props;
    return (
        <div className={"dash-header s-top-bar"}>
            <div className={"dash-header-inner"}>
                {/* No customization from useDashboardComponentsContext for now */}
                <DefaultLockedStatus {...lockedStatusProps} />
                <Title {...titleProps} />
                {/* No customization from useDashboardComponentsContext for now */}
                <DefaultShareStatus {...shareStatusProps} />
                <ButtonBar {...buttonBarProps} />
            </div>
            <MenuButton {...menuButtonProps} />
        </div>
    );
};

/**
 * @alpha
 */
export function DefaultTopBar(props: ITopBarProps): JSX.Element {
    const isExport = useDashboardSelector(selectIsExport);

    if (isExport) {
        return <HiddenTopBar {...props} />;
    }

    return <TopBarCore {...props} />;
}
