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
import { FormattedMessage, useIntl } from "react-intl";
import {
    IExecutionResultEnvelope,
    selectExecutionResultByRef,
    selectSettings,
    useDashboardSelector,
} from "../../../../model/index.js";
import { IInsightMenuSubmenuComponentProps } from "../../insightMenu/types.js";
import { isDataError, isDataErrorTooLarge } from "../../../../_staging/errors/errorPredicates.js";

const alignPoints: IAlignPoint[] = [{ align: "tl bl", offset: { x: 20, y: 0 } }];

const overlayController = OverlayController.getInstance(DASHBOARD_HEADER_OVERLAYS_Z_INDEX);

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
    onExportCSV: () => void;
    onExportRawCSV: () => void;
    onExportXLSX: () => void;
    onExportPowerPointPresentation: () => void;
    onExportPdfPresentation: () => void;
}

export const ExportOptions: React.FC<IExportOptionsProps> = ({
    widget,
    onClose,
    exportCsvDisabled,
    exportXLSVDisabled,
    exportCSVRawDisabled,
    exportPdfPresentationDisabled,
    exportPowerPointPresentationDisabled,
    isExportRawVisible,
    isExportVisible,
    onExportCSV,
    onExportRawCSV,
    onExportXLSX,
    onExportPowerPointPresentation,
    onExportPdfPresentation,
}) => {
    const intl = useIntl();
    const execution = useDashboardSelector(selectExecutionResultByRef(widget.ref));
    const settings = useDashboardSelector(selectSettings);

    const tooltip = getExportTooltip(execution, settings?.enableRawExports);
    const presentationTooltip = intl.formatMessage({
        id: "options.menu.export.presentation.unsupported.oldWidget",
    });

    return (
        <>
            {/* Header z-index start at  6000 so we need force all overlays z-indexes start at 6000 to be under header */}
            <OverlayControllerProvider overlayController={overlayController}>
                <ItemsWrapper className="gd-configuration-export-options" smallItemsSpacing={true}>
                    {isExportVisible ? (
                        <>
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
                                    bubbleTextId={presentationTooltip}
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
                                    bubbleTextId={presentationTooltip}
                                />
                            )}
                            <Header>{intl.formatMessage({ id: "options.menu.export.header.data" })}</Header>
                        </>
                    ) : null}
                    {isExportRawVisible ? (
                        <>
                            {!exportXLSVDisabled ? (
                                <MenuItem
                                    className="gd-export-options-xlsx"
                                    icon="gd-icon-type-sheet"
                                    onClick={() => {
                                        onClose();
                                        onExportXLSX();
                                    }}
                                    disabled={exportXLSVDisabled}
                                    messageId="widget.options.menu.XLSX"
                                />
                            ) : (
                                <MenuItemWithBubble
                                    className="gd-export-options-xlsx"
                                    icon="gd-icon-type-sheet"
                                    disabled={exportXLSVDisabled}
                                    messageId="widget.options.menu.XLSX"
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
                                    messageId="widget.options.menu.exportToCSV.formatted"
                                />
                            ) : (
                                <MenuItemWithBubble
                                    className="gd-export-options-csv"
                                    icon="gd-icon-type-csv-formatted"
                                    disabled={exportCsvDisabled}
                                    messageId="widget.options.menu.exportToCSV.formatted"
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
                                    messageId="widget.options.menu.exportToCSV.raw"
                                />
                            ) : (
                                <MenuItemWithBubble
                                    className="gd-export-options-csv-raw"
                                    icon="gd-icon-type-csv-raw"
                                    disabled={exportCSVRawDisabled}
                                    messageId="widget.options.menu.exportToCSV.raw"
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
