// (C) 2007-2021 GoodData Corporation
import React, { useState } from "react";
import { Icon } from "@gooddata/sdk-ui-kit";
import { LegendLabelItem } from "../LegendLabelItem";
import { LegendList } from "../LegendList";
import { IPushpinCategoryLegendItem, ItemBorderRadiusPredicate } from "../types";

const LEGEND_ROW_HEIGHT = 20;
const LEGEND_TOP_BOTTOM_PADDING = 10;

const useCheckOverflow = (): [boolean, number, (element: HTMLDivElement | null) => void] => {
    const [isOverflow, setOverFlow] = useState(false);
    const [numOfUsedRow, setNumOfUsedRow] = useState(1);

    const getNumberOfRows = (clientHeight: number) => {
        return (clientHeight - LEGEND_TOP_BOTTOM_PADDING) / LEGEND_ROW_HEIGHT;
    };

    const checkOverFlow = (element: HTMLDivElement | null) => {
        if (!element) return;
        const { clientHeight, scrollHeight } = element;
        setOverFlow(scrollHeight > clientHeight);

        const numberOfRows = getNumberOfRows(clientHeight);
        setNumOfUsedRow(numberOfRows);
    };

    return [isOverflow, numOfUsedRow, checkOverFlow];
};

export interface IRowLegendIcoButton {
    isVisible: boolean;
    onIconClick: () => void;
}

export const RowLegendIcoButton: React.FC<IRowLegendIcoButton> = (props) => {
    const { isVisible, onIconClick } = props;

    if (!isVisible) {
        return null;
    }

    const handleOnClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onIconClick();
    };

    return (
        <div className="legend-popup-button">
            <div onClick={handleOnClick} className="legend-popup-icon s-legend-popup-icon">
                <Icon.LegendMenu />
            </div>
        </div>
    );
};

export interface IRowLegendProps {
    legendLabel?: string;
    maxRowsCount?: number;
    series: IPushpinCategoryLegendItem[];
    enableBorderRadius?: boolean | ItemBorderRadiusPredicate;
    onDialogIconClick: () => void;
    onLegendItemClick: (item: IPushpinCategoryLegendItem) => void;
}

export const RowLegend: React.FC<IRowLegendProps> = (props) => {
    const {
        series,
        maxRowsCount = 1,
        legendLabel,
        enableBorderRadius,
        onDialogIconClick,
        onLegendItemClick,
    } = props;
    const [isOverflow, numOfUsedRow, checkOverFlow] = useCheckOverflow();

    const LEGEND_HEIGHT = maxRowsCount * LEGEND_ROW_HEIGHT + LEGEND_TOP_BOTTOM_PADDING;

    const itemsAlign = numOfUsedRow === 1 ? "flex-end" : "flex-start";

    return (
        <div className="legend-popup-row" style={{ maxHeight: LEGEND_HEIGHT }}>
            <div className="viz-legend static position-row">
                <div
                    className="series"
                    style={{
                        justifyContent: itemsAlign,
                    }}
                    ref={(element) => {
                        checkOverFlow(element);
                    }}
                >
                    <LegendLabelItem label={legendLabel} />
                    <LegendList
                        enableBorderRadius={enableBorderRadius}
                        series={series}
                        onItemClick={onLegendItemClick}
                    />
                </div>
            </div>
            <RowLegendIcoButton isVisible={isOverflow} onIconClick={onDialogIconClick} />
        </div>
    );
};
