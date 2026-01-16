// (C) 2021-2026 GoodData Corporation

import { useCallback } from "react";

import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";

import {
    Bubble,
    BubbleHoverTrigger,
    Dropdown,
    type IAlignPoint,
    type IDropdownButtonRenderProps,
    type IUiMenuInteractiveItemProps,
    ShortenedText,
    UiButton,
    UiIcon,
    UiMenu,
    UiTooltip,
} from "@gooddata/sdk-ui-kit";

import {
    type IMenuInteractiveItem,
    type IMenuItem,
    type IMenuItemData,
    useDrillDialogExportItems,
} from "./useDrillDialogExportItems.js";

function InteractiveItemWithIcon({ item, isFocused }: IUiMenuInteractiveItemProps<IMenuItemData>) {
    return (
        <div
            className={cx("gd-ui-kit-menu__item", "gd-ui-kit-menu__item--size-medium", {
                "gd-ui-kit-menu__item--isFocused": isFocused,
                "gd-ui-kit-menu__item--isSelected": !!item.isSelected,
                "gd-ui-kit-menu__item--isDisabled": !!item.isDisabled,
            })}
        >
            <UiIcon type={item.data.icon} />
            <ShortenedText className="gd-ui-kit-menu-item-title" ellipsisPosition="end">
                {item.stringTitle}
            </ShortenedText>
        </div>
    );
}

export interface IDrillDialogShareDropdownProps {
    exportAvailable: boolean;
    exportXLSXEnabled: boolean;
    exportCSVEnabled: boolean;
    exportCSVRawEnabled: boolean;
    exportPDFEnabled: boolean;
    exportPDFVisible: boolean;
    onExportXLSX: () => void;
    onExportCSV: () => void;
    onExportCSVRaw: () => void;
    onExportPDF: () => void;
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

export function DrillDialogExportDropdown({
    exportAvailable,
    exportXLSXEnabled,
    onExportXLSX,
    exportCSVEnabled,
    exportCSVRawEnabled,
    exportPDFEnabled,
    exportPDFVisible,
    onExportCSV,
    onExportCSVRaw,
    onExportPDF,
    isExporting,
    isExportRawVisible,
}: IDrillDialogShareDropdownProps) {
    const hasXLSXExport = exportXLSXEnabled;
    const hasCSVExport = exportCSVEnabled;
    const hasPDFExport = exportPDFEnabled && exportPDFVisible;
    const hasAnyExportFormat = hasXLSXExport || hasCSVExport || hasPDFExport;

    const isExportDisabled = !exportAvailable || !hasAnyExportFormat;
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
        isExportPDFEnabled: exportPDFEnabled,
        isExportPDFVisible: exportPDFVisible,

        onExportXLSX,
        onExportCSV,
        onExportCSVRaw,
        onExportPDF,
    });

    const handleSelectItem = useCallback((item: IMenuInteractiveItem) => {
        item.data.action();
    }, []);

    const itemDataTestId = useCallback(
        (item: IMenuItem) => (item.type === "interactive" ? item.data.dataTestId : undefined),
        [],
    );

    return (
        <div className={classNames}>
            <Dropdown
                autofocusOnOpen
                alignPoints={dropdownAlignPoints}
                renderBody={({ closeDropdown, ariaAttributes }) => (
                    <div className="gd-drill-dialog-export">
                        <UiMenu
                            onClose={closeDropdown}
                            ariaAttributes={ariaAttributes}
                            onSelect={handleSelectItem}
                            items={items}
                            dataTestId="s-drill-modal-export-options"
                            itemDataTestId={itemDataTestId}
                            InteractiveItem={DrillModalExportMenuItem}
                        />
                    </div>
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
}

function DrillModalExportMenuItem(props: IUiMenuInteractiveItemProps<IMenuItemData>) {
    const { item, isFocused } = props;

    const tooltip = item.data.disabledTooltip;

    return item.isDisabled && tooltip !== undefined ? (
        <>
            <UiTooltip
                triggerBy={isFocused ? [] : ["hover", "focus"]}
                arrowPlacement="right"
                optimalPlacement
                content={tooltip}
                anchor={<InteractiveItemWithIcon {...props} />}
            />
            {/* Screen reader announcement area */}
            <div className="sr-only" aria-live="polite">
                {tooltip}
            </div>
        </>
    ) : (
        <InteractiveItemWithIcon {...props} />
    );
}

function DropdownTriggerButton({
    toggleDropdown,
    buttonRef,
    accessibilityConfig,
    isDisabled,
}: IDropdownButtonRenderProps & { isDisabled?: boolean }) {
    const { formatMessage } = useIntl();
    return (
        <UiButton
            ref={(ref) => {
                buttonRef.current = ref;
            }}
            onClick={toggleDropdown}
            iconBefore="download"
            label={formatMessage({ id: "dialogs.export.submit" })}
            variant="tertiary"
            isDisabled={isDisabled}
            accessibilityConfig={{
                ...accessibilityConfig,
                ariaHaspopup: "menu",
            }}
        />
    );
}
