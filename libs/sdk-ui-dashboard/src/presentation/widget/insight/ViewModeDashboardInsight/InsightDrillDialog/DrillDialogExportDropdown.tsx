// (C) 2021-2025 GoodData Corporation
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import cx from "classnames";
import {
    Bubble,
    BubbleHoverTrigger,
    DefaultUiMenuInteractiveItem,
    Dropdown,
    IAlignPoint,
    IDropdownButtonRenderProps,
    UiMenu,
    IUiMenuInteractiveItemProps,
    UiButton,
} from "@gooddata/sdk-ui-kit";

import {
    IMenuInteractiveItem,
    IMenuItem,
    IMenuItemData,
    useDrillDialogExportItems,
} from "./useDrillDialogExportItems.js";

export interface IDrillDialogShareDropdownProps {
    exportAvailable: boolean;
    exportXLSXEnabled: boolean;
    exportCSVRawEnabled: boolean;
    onExportXLSX: () => void;
    exportCSVEnabled: boolean;
    onExportCSV: () => void;
    onExportCSVRaw: () => void;
    isLoading: boolean;
    isExporting: boolean;
    isExportRawVisible: boolean;
}

const dropdownAlignPoints: IAlignPoint[] = [
    {
        align: "tc bc",
        offset: {
            x: -10,
            y: -5,
        },
    },
];
const dropdownDisabledBubbleAlignPoints: IAlignPoint[] = [{ align: "tc bc" }];
const itemBubbleAlignPoints: IAlignPoint[] = [{ align: "cl br" }];

export const DrillDialogExportDropdown: React.FC<IDrillDialogShareDropdownProps> = ({
    exportAvailable,
    exportXLSXEnabled,
    onExportXLSX,
    exportCSVEnabled,
    exportCSVRawEnabled,
    onExportCSV,
    onExportCSVRaw,
    isExporting,
    isExportRawVisible,
}) => {
    const isExportDisabled = !exportAvailable || (!exportXLSXEnabled && !exportCSVEnabled);
    const isDropdownDisabled = isExportDisabled && !isExportRawVisible;

    const classNames = cx("s-export-drilled-insight export-drilled-insight", {
        "is-disabled": isDropdownDisabled,
    });

    const items = useDrillDialogExportItems({
        isExporting,

        isDropdownDisabled,
        isExportRawVisible,

        isExportXLSXEnabled: exportXLSXEnabled,
        isExportCSVEnabled: exportCSVEnabled,
        isExportCSVRawEnabled: exportCSVRawEnabled,

        onExportXLSX,
        onExportCSV,
        onExportCSVRaw,
    });

    const handleSelectItem = React.useCallback((item: IMenuInteractiveItem) => {
        item.data.action();
    }, []);

    const itemDataTestId = React.useCallback(
        (item: IMenuItem) => (item.type === "interactive" ? item.data.dataTestId : undefined),
        [],
    );

    return (
        <div className={classNames}>
            <Dropdown
                autofocusOnOpen
                alignPoints={dropdownAlignPoints}
                renderBody={({ closeDropdown, ariaAttributes }) => (
                    <UiMenu
                        onClose={closeDropdown}
                        ariaAttributes={ariaAttributes}
                        onSelect={handleSelectItem}
                        items={items}
                        dataTestId="s-drill-modal-export-options"
                        itemDataTestId={itemDataTestId}
                        InteractiveItem={DrillModalExportMenuItem}
                    />
                )}
                renderButton={(buttonRenderProps) => {
                    return isDropdownDisabled ? (
                        <div className={classNames}>
                            <BubbleHoverTrigger>
                                <DropdownTriggerButton {...buttonRenderProps} isDisabled />
                                <Bubble
                                    className="bubble-primary"
                                    alignPoints={dropdownDisabledBubbleAlignPoints}
                                >
                                    <FormattedMessage id="export_unsupported.disabled" />
                                </Bubble>
                            </BubbleHoverTrigger>
                        </div>
                    ) : (
                        <DropdownTriggerButton {...buttonRenderProps} />
                    );
                }}
            />
        </div>
    );
};

const DrillModalExportMenuItem: React.FC<IUiMenuInteractiveItemProps<IMenuItemData>> = (props) => {
    const { item } = props;

    const tooltip = item.data.disabledTooltip;

    return item.isDisabled && tooltip !== undefined ? (
        <BubbleHoverTrigger>
            <DefaultUiMenuInteractiveItem {...props} />
            <Bubble className="bubble-primary" alignPoints={itemBubbleAlignPoints}>
                {tooltip}
            </Bubble>
        </BubbleHoverTrigger>
    ) : (
        <DefaultUiMenuInteractiveItem {...props} />
    );
};

const DropdownTriggerButton: React.FC<IDropdownButtonRenderProps & { isDisabled?: boolean }> = ({
    toggleDropdown,
    buttonRef,
    accessibilityConfig,
    isDisabled,
}) => {
    const { formatMessage } = useIntl();
    return (
        <UiButton
            ref={(ref) => (buttonRef.current = ref)}
            onClick={toggleDropdown}
            iconBefore="download"
            label={formatMessage({ id: "dialogs.export.submit" })}
            variant="tertiary"
            isDisabled={isDisabled}
            accessibilityConfig={accessibilityConfig}
        />
    );
};
