// (C) 2021-2026 GoodData Corporation

import { type ReactElement, useCallback } from "react";

import { HiddenTopBar } from "./HiddenTopBar.js";
import { type ITopBarProps } from "./types.js";
import { renameDashboard } from "../../../model/commands/dashboard.js";
import { useDashboardDispatch, useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import {
    selectEnableSnapshotExportAccessibility,
    selectIsExport,
    selectIsReadOnly,
} from "../../../model/store/config/configSelectors.js";
import {
    selectDashboardShareInfo,
    selectDashboardTitle,
    selectPersistedDashboard,
} from "../../../model/store/meta/metaSelectors.js";
import { useCancelButtonProps } from "../buttonBar/button/cancelButton/DefaultCancelButton.js";
import { useEditButtonProps } from "../buttonBar/button/editButton/DefaultEditButton.js";
import { useSaveAsNewButtonProps } from "../buttonBar/button/saveAsButton/DefaultSaveAsNewButton.js";
import { useSaveButtonProps } from "../buttonBar/button/saveButton/DefaultSaveButton.js";
import { useSettingButtonProps } from "../buttonBar/button/settingButton/DefaultSettingButton.js";
import { useShareButtonProps } from "../buttonBar/button/shareButton/DefaultShareButton.js";
import { ButtonBar } from "../buttonBar/ButtonBar.js";
import { DefaultButtonBar } from "../buttonBar/DefaultButtonBar.js";
import { DefaultMenuButton } from "../menuButton/DefaultMenuButton.js";
import { MenuButton } from "../menuButton/MenuButton.js";
import { useDefaultMenuItems } from "../menuButton/useDefaultMenuItems.js";
import { DefaultLockedStatus } from "../shareIndicators/lockedStatus/DefaultLockedStatus.js";
import { DefaultShareStatus } from "../shareIndicators/shareStatus/DefaultShareStatus.js";
import { Title } from "../title/Title.js";

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

function TopBarCore({
    menuButtonProps,
    titleProps,
    buttonBarProps,
    shareStatusProps,
    lockedStatusProps,
}: ITopBarProps): ReactElement {
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
