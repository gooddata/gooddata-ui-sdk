// (C) 2007-2022 GoodData Corporation
import React, { useState } from "react";
import { Icon } from "@gooddata/sdk-ui-kit";
import cx from "classnames";
import { LegendLabelItem } from "../LegendLabelItem.js";
import { LegendList } from "../LegendList.js";
import { IPushpinCategoryLegendItem, ItemBorderRadiusPredicate } from "../types.js";

const LEGEND_ROW_HEIGHT = 20;
const LEGEND_TOP_BOTTOM_PADDING = 10;

const useCheckOverflow = (): [boolean, number, (element: HTMLDivElement | null) => void] => {
    const [isOverflow, setOverFlow] = useState(false);
    const [numOfUsedRow, setNumOfUsedRow] = useState(1);

    const getNumberOfRows = (clientHeight: number) => {
        return Math.ceil((clientHeight - LEGEND_TOP_BOTTOM_PADDING) / LEGEND_ROW_HEIGHT);
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
    isActive: boolean;
    onIconClick: () => void;
}

export const RowLegendIcoButton: React.FC<IRowLegendIcoButton> = (props) => {
    const { isVisible, isActive, onIconClick } = props;

    if (!isVisible) {
        return null;
    }

    const handleOnClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();
        e.preventDefault();
        onIconClick();
    };

    const iconClasses = cx("legend-popup-icon s-legend-popup-icon", {
        "legend-popup-icon-active": isActive,
    });
    return (
        <div className="legend-popup-button">
            <div onClick={handleOnClick} className={iconClasses}>
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
    isActive?: boolean;
}

export const RowLegend: React.FC<IRowLegendProps> = (props) => {
    const {
        series,
        maxRowsCount = 1,
        legendLabel,
        enableBorderRadius,
        onDialogIconClick,
        onLegendItemClick,
        isActive = false,
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
            <RowLegendIcoButton isActive={isActive} isVisible={isOverflow} onIconClick={onDialogIconClick} />
        </div>
    );
};
