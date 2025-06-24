// (C) 2024-2025 GoodData Corporation
import React from "react";
import { IInsightDefinition, widgetTitle } from "@gooddata/sdk-model";
import {
    OverlayControllerProvider,
    OverlayController,
    ItemsWrapper,
    Item,
    withBubble,
    IAlignPoint,
} from "@gooddata/sdk-ui-kit";

import { DASHBOARD_HEADER_OVERLAYS_Z_INDEX } from "../../../constants/index.js";

import { FormattedMessage, useIntl } from "react-intl";
import { useInsightExport } from "../../common/useInsightExport.js";
import {
    selectExecutionResultByRef,
    selectInsightByRef,
    useDashboardSelector,
} from "../../../../model/index.js";
import { IInsightMenuSubmenuComponentProps } from "../../insightMenu/types.js";
import { isDataError, isDataErrorTooLarge } from "../../../../_staging/errors/errorPredicates.js";

const alignPoints: IAlignPoint[] = [{ align: "tl bl", offset: { x: 20, y: 0 } }];

const overlayController = OverlayController.getInstance(DASHBOARD_HEADER_OVERLAYS_Z_INDEX);

interface IMenuItemProps {
    className: string;
    onClick?: () => void;
    messageId: string;
    disabled: boolean;
}

const MenuItem: React.FC<IMenuItemProps> = ({ className, disabled, messageId, onClick }) => {
    return (
        <Item onClick={onClick} className={className} disabled={disabled}>
            <div className="gd-icon-download" />
            <FormattedMessage id={messageId} />
        </Item>
    );
};

const MenuItemWithBubble = withBubble(MenuItem);

export const ExportOptions: React.FC<IInsightMenuSubmenuComponentProps> = ({ widget, onClose }) => {
    const intl = useIntl();

    const insight: IInsightDefinition = useDashboardSelector(selectInsightByRef(widget.insight))!;

    const execution = useDashboardSelector(selectExecutionResultByRef(widget.ref));

    const partialWarning =
        execution?.warnings?.filter((warning) => warning.warningCode === "gdc.pixtab.partial") ?? [];

    const tooltip =
        isDataErrorTooLarge(execution?.error) || partialWarning.length > 0
            ? "options.menu.data.too.large"
            : isDataError(execution?.error)
            ? "options.menu.unsupported.error"
            : "options.menu.unsupported.loading";

    const {
        exportCSVEnabled,
        exportXLSXEnabled,
        isExportRawInNewUiVisible,
        onExportCSV,
        onExportRawCSV,
        onExportXLSX,
    } = useInsightExport({
        widgetRef: widget.ref,
        title: widgetTitle(widget) || intl.formatMessage({ id: "export.defaultTitle" }),
        insight,
    });

    return (
        <>
            {/* Header z-index start at  6000 so we need force all overlays z-indexes start at 6000 to be under header */}
            <OverlayControllerProvider overlayController={overlayController}>
                <ItemsWrapper className="gd-configuration-export-options" smallItemsSpacing={true}>
                    {isExportRawInNewUiVisible ? (
                        <>
                            {exportXLSXEnabled ? (
                                <MenuItem
                                    className="gd-export-options-xlsx"
                                    onClick={() => {
                                        onClose();
                                        onExportXLSX();
                                    }}
                                    disabled={!exportXLSXEnabled}
                                    messageId="widget.options.menu.XLSX"
                                />
                            ) : (
                                <MenuItemWithBubble
                                    className="gd-export-options-xlsx"
                                    disabled={!exportXLSXEnabled}
                                    messageId="widget.options.menu.XLSX"
                                    showBubble={true}
                                    alignPoints={alignPoints}
                                    bubbleTextId={tooltip}
                                />
                            )}
                            {exportCSVEnabled ? (
                                <MenuItem
                                    onClick={() => {
                                        onClose();
                                        onExportCSV();
                                    }}
                                    className="gd-export-options-csv"
                                    disabled={!exportCSVEnabled}
                                    messageId="widget.options.menu.exportToCSV.formatted"
                                />
                            ) : (
                                <MenuItemWithBubble
                                    className="gd-export-options-csv"
                                    disabled={!exportCSVEnabled}
                                    messageId="widget.options.menu.exportToCSV.formatted"
                                    showBubble={true}
                                    alignPoints={alignPoints}
                                    bubbleTextId={tooltip}
                                />
                            )}
                            <MenuItem
                                onClick={() => {
                                    onClose();
                                    onExportRawCSV();
                                }}
                                className="gd-export-options-csv-raw"
                                disabled={false}
                                messageId="widget.options.menu.exportToCSV.raw"
                            />
                        </>
                    ) : null}
                </ItemsWrapper>
            </OverlayControllerProvider>
        </>
    );
};
