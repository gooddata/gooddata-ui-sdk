// (C) 2021-2025 GoodData Corporation

import { ReactElement, useCallback } from "react";

import { HiddenTopBar } from "./HiddenTopBar.js";
import { ITopBarProps } from "./types.js";
import {
    renameDashboard,
    selectDashboardShareInfo,
    selectDashboardTitle,
    selectEnableSnapshotExportAccessibility,
    selectIsExport,
    selectIsReadOnly,
    selectPersistedDashboard,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../model/index.js";
import {
    useCancelButtonProps,
    useEditButtonProps,
    useSaveAsNewButtonProps,
    useSaveButtonProps,
    useSettingButtonProps,
    useShareButtonProps,
} from "../buttonBar/button/index.js";
import { ButtonBar, DefaultButtonBar } from "../buttonBar/index.js";
import { DefaultMenuButton, MenuButton, useDefaultMenuItems } from "../menuButton/index.js";
import { DefaultLockedStatus, DefaultShareStatus } from "../shareIndicators/index.js";
import { Title } from "../title/index.js";

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
    const settingButtonProps = useSettingButtonProps();

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
            settingButtonProps,
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

function TopBarCore(props: ITopBarProps): ReactElement {
    const { menuButtonProps, titleProps, buttonBarProps, shareStatusProps, lockedStatusProps } = props;
    const snapshotExportAccessibilityEnabled = useDashboardSelector(selectEnableSnapshotExportAccessibility);
    const isExport = useDashboardSelector(selectIsExport);

    if (isExport && snapshotExportAccessibilityEnabled) {
        return (
            <div className={"dash-header dash-header-export s-top-bar"}>
                <div className={"dash-header-inner"}>
                    <Title {...titleProps} />
                </div>
            </div>
        );
    }

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
}

/**
 * @alpha
 */
export function DefaultTopBar(props: ITopBarProps): ReactElement {
    const isExport = useDashboardSelector(selectIsExport);
    const snapshotExportAccessibilityEnabled = useDashboardSelector(selectEnableSnapshotExportAccessibility);

    if (isExport && !snapshotExportAccessibilityEnabled) {
        return <HiddenTopBar {...props} />;
    }

    return <TopBarCore {...props} />;
}
