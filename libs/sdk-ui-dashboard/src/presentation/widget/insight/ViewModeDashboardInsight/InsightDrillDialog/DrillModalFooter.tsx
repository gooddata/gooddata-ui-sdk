// (C) 2021-2025 GoodData Corporation
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import cx from "classnames";
import {
    BubbleHoverTrigger,
    Bubble,
    Dropdown,
    UiMenu,
    IUiMenuInteractiveItem,
    UiMenuInteractiveItemProps,
    DefaultUiMenuInteractiveItemComponent,
    IAlignPoint,
} from "@gooddata/sdk-ui-kit";

import {
    IExecutionResultEnvelope,
    selectExecutionResultByRef,
    selectSettings,
    useDashboardSelector,
} from "../../../../../model/index.js";
import { idRef } from "@gooddata/sdk-model";
import { isDataError, isDataErrorTooLarge } from "../../../../../_staging/errors/errorPredicates.js";

export interface IDrillModalFooterProps {
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

const dropdownDisabledBubbleAlignPoints: IAlignPoint[] = [{ align: "tc bc" }];

type IMenuItem = IUiMenuInteractiveItem<{ action: () => void; disabledTooltip?: string; className?: string }>;

const DRILL_MODAL_EXECUTION_PSEUDO_REF = idRef("@@GDC_DRILL_MODAL");

const getExportTooltip = (execution?: IExecutionResultEnvelope, enableRawExports?: boolean): string => {
    if (isDataErrorTooLarge(execution?.error)) {
        return "options.menu.data.too.large";
    } else if (isDataError(execution?.error)) {
        if (enableRawExports) {
            return "options.menu.unsupported.raw.error";
        } else {
            return "options.menu.unsupported.error";
        }
    }
    return "options.menu.unsupported.loading";
};

const DrillModalExportMenuItem: React.FC<UiMenuInteractiveItemProps<IMenuItem["data"]>> = (props) => {
    const { item } = props;

    const tooltip = item.data.disabledTooltip;

    return item.isDisabled && tooltip !== undefined ? (
        <BubbleHoverTrigger>
            <DefaultUiMenuInteractiveItemComponent {...props} />
            <Bubble className="bubble-primary" alignPoints={[{ align: "cl br" }]}>
                {tooltip}
            </Bubble>
        </BubbleHoverTrigger>
    ) : (
        <DefaultUiMenuInteractiveItemComponent {...props} />
    );
};

const overlayAlignPoints: IAlignPoint[] = [
    {
        align: "tc bc",
        offset: {
            x: -10,
            y: -5,
        },
    },
];

export const DrillModalFooter: React.FC<IDrillModalFooterProps> = ({
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
    const { formatMessage } = useIntl();

    const handleSelectItem = React.useCallback((item: IMenuItem) => {
        item.data.action();
    }, []);

    const isExportDisabled = !exportAvailable || (!exportXLSXEnabled && !exportCSVEnabled);
    const isDropdownDisabled = isExportDisabled && !isExportRawVisible;

    const execution = useDashboardSelector(selectExecutionResultByRef(DRILL_MODAL_EXECUTION_PSEUDO_REF));
    const settings = useDashboardSelector(selectSettings);
    const disabledTooltip = formatMessage({
        id: isExporting
            ? "options.menu.export.in.progress"
            : getExportTooltip(execution, settings?.enableRawExports),
    });

    const classNames = cx("s-export-drilled-insight export-drilled-insight", {
        "is-disabled": isExportRawVisible ? false : isExportDisabled,
    });

    const items = React.useMemo<IMenuItem[]>(() => {
        const allItems = [
            {
                type: "interactive" as const,
                data: {
                    action: onExportXLSX,
                    className: "s-export-drilled-insight-xlsx",
                    disabledTooltip,
                },
                id: "xslx",
                stringTitle: formatMessage({ id: "widget.drill.dialog.exportToXLSX" }),
                isDisabled: !exportXLSXEnabled,
            },
            {
                type: "interactive" as const,
                data: {
                    action: onExportCSV,
                    className: "s-export-drilled-insight-csv-formatted",
                    disabledTooltip,
                },
                id: "csv-formatted",
                stringTitle: formatMessage({ id: "widget.drill.dialog.exportToCSV.formatted" }),
                isDisabled: !exportCSVEnabled,
            },
            {
                type: "interactive" as const,
                data: {
                    action: onExportCSVRaw,
                    className: "s-export-drilled-insight-csv-raw",
                    disabledTooltip,
                },
                id: "csv-raw",
                stringTitle: formatMessage({ id: "widget.drill.dialog.exportToCSV.raw" }),
                isDisabled: !exportCSVRawEnabled,
            },
        ];

        if (isExportRawVisible) {
            return allItems;
        }

        if (isDropdownDisabled) {
            return [];
        }

        return allItems.filter((item) => !item.isDisabled);
    }, [
        onExportXLSX,
        disabledTooltip,
        formatMessage,
        exportXLSXEnabled,
        onExportCSV,
        exportCSVEnabled,
        onExportCSVRaw,
        exportCSVRawEnabled,
        isExportRawVisible,
        isDropdownDisabled,
    ]);

    return (
        <div className={classNames}>
            <Dropdown
                autofocusOnOpen
                alignPoints={overlayAlignPoints}
                renderBody={({ closeDropdown, ariaAttributes }) => (
                    <UiMenu
                        onClose={closeDropdown}
                        ariaAttributes={ariaAttributes}
                        onSelect={handleSelectItem}
                        items={items}
                        className={"s-drill-modal-export-options"}
                        itemClassName={(item) =>
                            item.type === "interactive" ? item.data.className : undefined
                        }
                        InteractiveItemComponent={DrillModalExportMenuItem}
                    />
                )}
                renderButton={({ buttonRef, toggleDropdown, ariaAttributes }) => {
                    const toggleButton = (
                        <button
                            onClick={toggleDropdown}
                            className={cx(
                                "gd-button-link-dimmed gd-button gd-icon-download export-menu-toggle-button",
                                {
                                    disabled: isDropdownDisabled,
                                },
                            )}
                            type="button"
                            ref={buttonRef as React.MutableRefObject<HTMLButtonElement>}
                            {...ariaAttributes}
                        >
                            <span className="gd-button-text">
                                <FormattedMessage id="dialogs.export.submit" />
                            </span>
                        </button>
                    );

                    return isDropdownDisabled ? (
                        <div className={classNames}>
                            <BubbleHoverTrigger>
                                {toggleButton}
                                <Bubble
                                    className="bubble-primary"
                                    alignPoints={dropdownDisabledBubbleAlignPoints}
                                >
                                    <FormattedMessage id="export_unsupported.disabled" />
                                </Bubble>
                            </BubbleHoverTrigger>
                        </div>
                    ) : (
                        toggleButton
                    );
                }}
            />
        </div>
    );
};
