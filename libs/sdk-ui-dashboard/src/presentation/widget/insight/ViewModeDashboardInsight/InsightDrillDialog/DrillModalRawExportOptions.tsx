// (C) 2021-2024 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { Overlay, ItemsWrapper, Item, IAlignPoint, BubbleHoverTrigger, Bubble } from "@gooddata/sdk-ui-kit";
import { idRef } from "@gooddata/sdk-model";
import { selectExecutionResultByRef, useDashboardSelector } from "../../../../../model/index.js";
import { isDataError, isDataErrorTooLarge } from "../../../../../_staging/errors/errorPredicates.js";

const overlayAlignPoints: IAlignPoint[] = [
    {
        align: "tc bc",
        offset: {
            x: -10,
            y: -5,
        },
    },
];

const bubbleAlignPoints: IAlignPoint[] = [{ align: "cl br" }];

export interface IDrillModalRawExportOptionsProps {
    showDropdown: boolean;
    toggleShowDropdown(): void;
    exportXLSXEnabled: boolean;
    onExportXLSX: () => void;
    exportCSVEnabled: boolean;
    onExportCSV: () => void;
    onExportCSVRaw: () => void;
}

interface IDrillModalExportMenuItemProps {
    className: string;
    disabled: boolean;
    messageId: string;
    bubbleTextId: string;
    onClick: () => void;
}

interface IDrillModalExportItemProps {
    className: string;
    messageId: string;
    disabled: boolean;
    onClick?: () => void;
}

const DrillModalExportItem: React.FC<IDrillModalExportItemProps> = ({
    className,
    messageId,
    disabled,
    onClick,
}) => {
    return (
        <Item onClick={onClick} className={className} disabled={disabled}>
            <FormattedMessage id={messageId} />
        </Item>
    );
};
const DrillModalExportMenuItem: React.FC<IDrillModalExportMenuItemProps> = ({
    className,
    disabled,
    messageId,
    bubbleTextId,
    onClick,
}) => {
    return disabled ? (
        <BubbleHoverTrigger>
            <DrillModalExportItem className={className} messageId={messageId} disabled={disabled} />
            <Bubble className="bubble-primary" alignPoints={bubbleAlignPoints}>
                <FormattedMessage id={bubbleTextId} />
            </Bubble>
        </BubbleHoverTrigger>
    ) : (
        <DrillModalExportItem
            onClick={onClick}
            className={className}
            messageId={messageId}
            disabled={disabled}
        />
    );
};

const DRILL_MODAL_EXECUTION_PSEUDO_REF = idRef("@@GDC_DRILL_MODAL");

const DrillModalRawExportOptions: React.FC<IDrillModalRawExportOptionsProps> = ({
    showDropdown,
    exportXLSXEnabled,
    exportCSVEnabled,
    toggleShowDropdown,
    onExportXLSX,
    onExportCSV,
    onExportCSVRaw,
}) => {
    const execution = useDashboardSelector(selectExecutionResultByRef(DRILL_MODAL_EXECUTION_PSEUDO_REF));

    const partialWarning =
        execution?.warnings?.filter((warning) => warning.warningCode === "gdc.pixtab.partial") ?? [];

    const tooltip =
        isDataErrorTooLarge(execution?.error) || partialWarning.length > 0
            ? "widget.drill.modal.data.too.large"
            : isDataError(execution?.error)
            ? "options.menu.unsupported.error"
            : "options.menu.unsupported.loading";

    return showDropdown ? (
        <Overlay
            key="DrillModalOptionsMenu"
            alignTo=".export-drilled-insight"
            alignPoints={overlayAlignPoints}
            className="gd-header-menu-overlay s-drill-modal-export-options"
            closeOnOutsideClick={true}
            onClose={toggleShowDropdown}
        >
            <ItemsWrapper smallItemsSpacing={true}>
                <DrillModalExportMenuItem
                    onClick={onExportXLSX}
                    className="options-menu-export-xlsx s-export-drilled-insight-xlsx"
                    disabled={!exportXLSXEnabled}
                    bubbleTextId={tooltip}
                    messageId="widget.drill.dialog.exportToXLSX"
                />
                <DrillModalExportMenuItem
                    onClick={onExportCSV}
                    className="options-menu-export-csv-formatted s-export-drilled-insight-csv-formatted"
                    disabled={!exportCSVEnabled}
                    bubbleTextId={tooltip}
                    messageId="widget.drill.dialog.exportToCSV.formatted"
                />
                <Item
                    onClick={onExportCSVRaw}
                    className="options-menu-export-csv-raw s-export-drilled-insight-csv"
                >
                    <FormattedMessage id="widget.drill.dialog.exportToCSV.raw" />
                </Item>
            </ItemsWrapper>
        </Overlay>
    ) : null;
};

export default DrillModalRawExportOptions;
