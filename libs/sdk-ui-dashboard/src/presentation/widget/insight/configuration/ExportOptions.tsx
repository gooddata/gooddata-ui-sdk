// (C) 2024-2025 GoodData Corporation
import React from "react";
import {
    OverlayControllerProvider,
    OverlayController,
    ItemsWrapper,
    Item,
    withBubble,
    IAlignPoint,
    Header,
} from "@gooddata/sdk-ui-kit";
import { DASHBOARD_HEADER_OVERLAYS_Z_INDEX } from "../../../constants/index.js";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import {
    IExecutionResultEnvelope,
    selectExecutionResultByRef,
    selectSettings,
    useDashboardSelector,
} from "../../../../model/index.js";
import { IInsightMenuSubmenuComponentProps } from "../../insightMenu/types.js";
import { isDataError, isDataErrorTooLarge } from "../../../../_staging/errors/errorPredicates.js";
import { selectEnableWidgetExportPngImage } from "../../../../model/store/config/configSelectors.js";

const alignPoints: IAlignPoint[] = [{ align: "tl bl", offset: { x: 20, y: 0 } }];

const overlayController = OverlayController.getInstance(DASHBOARD_HEADER_OVERLAYS_Z_INDEX);

const exportMessages = defineMessages({
    xlsxFormatted: { id: "widget.options.menu.XLSX" },
    csvFormatted: { id: "widget.options.menu.exportToCSV.formatted" },
    csvRaw: { id: "widget.options.menu.exportToCSV.raw" },
});

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

interface IMenuItemProps {
    className: string;
    icon: string;
    onClick?: () => void;
    messageId: string;
    disabled: boolean;
}

const MenuItem: React.FC<IMenuItemProps> = ({ className, disabled, messageId, onClick, icon }) => {
    return (
        <Item onClick={onClick} className={className} disabled={disabled}>
            <div className={`gd-export-icon ${icon}`} />
            <FormattedMessage id={messageId} />
        </Item>
    );
};

const MenuItemWithBubble = withBubble(MenuItem);

interface IExportOptionsProps extends IInsightMenuSubmenuComponentProps {
    exportCsvDisabled: boolean;
    exportXLSVDisabled: boolean;
    isExportVisible: boolean;
    isExportRawVisible: boolean;
    exportCSVRawDisabled: boolean;
    exportPdfPresentationDisabled: boolean;
    exportPowerPointPresentationDisabled: boolean;
    exportPngImageDisabled: boolean;
    onExportCSV: () => void;
    onExportRawCSV: () => void;
    onExportXLSX: () => void;
    onExportPowerPointPresentation: () => void;
    onExportPdfPresentation: () => void;
    onExportPngImage: () => void;
}

export const ExportOptions: React.FC<IExportOptionsProps> = ({
    widget,
    onClose,
    exportCsvDisabled,
    exportXLSVDisabled,
    exportCSVRawDisabled,
    exportPdfPresentationDisabled,
    exportPowerPointPresentationDisabled,
    exportPngImageDisabled,
    isExportRawVisible,
    isExportVisible,
    onExportCSV,
    onExportRawCSV,
    onExportXLSX,
    onExportPowerPointPresentation,
    onExportPdfPresentation,
    onExportPngImage,
}) => {
    const intl = useIntl();
    const execution = useDashboardSelector(selectExecutionResultByRef(widget.ref));
    const settings = useDashboardSelector(selectSettings);
    const enableWidgetExportPngImage = useDashboardSelector(selectEnableWidgetExportPngImage);

    const tooltip = getExportTooltip(execution, settings?.enableRawExports);
    const unsupportedExportTooltip = intl.formatMessage({
        id: "options.menu.export.presentation.unsupported.oldWidget",
    });

    return (
        <>
            {/* Header z-index start at  6000 so we need force all overlays z-indexes start at 6000 to be under header */}
            <OverlayControllerProvider overlayController={overlayController}>
                <ItemsWrapper className="gd-configuration-export-options" smallItemsSpacing={true}>
                    {isExportVisible ? (
                        <>
                            {enableWidgetExportPngImage && !exportPngImageDisabled ? (
                                <MenuItem
                                    onClick={() => {
                                        onClose();
                                        onExportPngImage();
                                    }}
                                    disabled={exportPngImageDisabled}
                                    className="gd-export-options-png"
                                    icon="gd-icon-type-image"
                                    messageId="options.menu.export.image.PNG"
                                />
                            ) : enableWidgetExportPngImage ? (
                                <MenuItemWithBubble
                                    className="gd-export-options-png"
                                    icon="gd-icon-type-image"
                                    disabled={exportPngImageDisabled}
                                    messageId="options.menu.export.image.PNG"
                                    showBubble={true}
                                    alignPoints={alignPoints}
                                    bubbleTextId={unsupportedExportTooltip}
                                />
                            ) : null}
                            {!exportPdfPresentationDisabled ? (
                                <MenuItem
                                    onClick={() => {
                                        onClose();
                                        onExportPdfPresentation();
                                    }}
                                    disabled={exportPdfPresentationDisabled}
                                    className="gd-export-options-pdf-presentation"
                                    icon="gd-icon-type-pdf"
                                    messageId="options.menu.export.presentation.PDF"
                                />
                            ) : (
                                <MenuItemWithBubble
                                    className="gd-export-options-pdf-presentation"
                                    icon="gd-icon-type-pdf"
                                    disabled={exportPdfPresentationDisabled}
                                    messageId="options.menu.export.presentation.PDF"
                                    showBubble={true}
                                    alignPoints={alignPoints}
                                    bubbleTextId={unsupportedExportTooltip}
                                />
                            )}
                            {!exportPowerPointPresentationDisabled ? (
                                <MenuItem
                                    onClick={() => {
                                        onClose();
                                        onExportPowerPointPresentation();
                                    }}
                                    disabled={exportPowerPointPresentationDisabled}
                                    className="gd-export-options-pptx-presentation"
                                    icon="gd-icon-type-slides"
                                    messageId="options.menu.export.presentation.PPTX"
                                />
                            ) : (
                                <MenuItemWithBubble
                                    className="gd-export-options-pptx-presentation"
                                    icon="gd-icon-type-slides"
                                    disabled={exportPowerPointPresentationDisabled}
                                    messageId="options.menu.export.presentation.PPTX"
                                    showBubble={true}
                                    alignPoints={alignPoints}
                                    bubbleTextId={unsupportedExportTooltip}
                                />
                            )}
                        </>
                    ) : null}
                    {isExportRawVisible ? (
                        <>
                            <Header>{intl.formatMessage({ id: "options.menu.export.header.data" })}</Header>
                            {!exportXLSVDisabled ? (
                                <MenuItem
                                    className="gd-export-options-xlsx"
                                    icon="gd-icon-type-sheet"
                                    onClick={() => {
                                        onClose();
                                        onExportXLSX();
                                    }}
                                    disabled={exportXLSVDisabled}
                                    messageId={exportMessages.xlsxFormatted.id}
                                />
                            ) : (
                                <MenuItemWithBubble
                                    className="gd-export-options-xlsx"
                                    icon="gd-icon-type-sheet"
                                    disabled={exportXLSVDisabled}
                                    messageId={exportMessages.xlsxFormatted.id}
                                    showBubble={true}
                                    alignPoints={alignPoints}
                                    bubbleTextId={tooltip}
                                />
                            )}
                            {!exportCsvDisabled ? (
                                <MenuItem
                                    onClick={() => {
                                        onClose();
                                        onExportCSV();
                                    }}
                                    className="gd-export-options-csv"
                                    icon="gd-icon-type-csv-formatted"
                                    disabled={exportCsvDisabled}
                                    messageId={exportMessages.csvFormatted.id}
                                />
                            ) : (
                                <MenuItemWithBubble
                                    className="gd-export-options-csv"
                                    icon="gd-icon-type-csv-formatted"
                                    disabled={exportCsvDisabled}
                                    messageId={exportMessages.csvFormatted.id}
                                    showBubble={true}
                                    alignPoints={alignPoints}
                                    bubbleTextId={tooltip}
                                />
                            )}
                            {!exportCSVRawDisabled ? (
                                <MenuItem
                                    onClick={() => {
                                        onClose();
                                        onExportRawCSV();
                                    }}
                                    className="gd-export-options-csv"
                                    icon="gd-icon-type-csv-raw"
                                    disabled={exportCSVRawDisabled}
                                    messageId={exportMessages.csvRaw.id}
                                />
                            ) : (
                                <MenuItemWithBubble
                                    className="gd-export-options-csv-raw"
                                    icon="gd-icon-type-csv-raw"
                                    disabled={exportCSVRawDisabled}
                                    messageId={exportMessages.csvRaw.id}
                                    showBubble={true}
                                    alignPoints={alignPoints}
                                    bubbleTextId={tooltip}
                                />
                            )}
                        </>
                    ) : null}
                </ItemsWrapper>
            </OverlayControllerProvider>
        </>
    );
};
