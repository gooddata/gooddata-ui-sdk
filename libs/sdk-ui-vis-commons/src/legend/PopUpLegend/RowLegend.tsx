// (C) 2007-2025 GoodData Corporation
import React, { useState } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { Button, Icon } from "@gooddata/sdk-ui-kit";

import { LegendLabelItem } from "../LegendLabelItem.js";
import { LegendList } from "../LegendList.js";
import { LegendSeries } from "../LegendSeries.js";
import { ISeriesItem, ItemBorderRadiusPredicate } from "../types.js";

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
    dialogId: string;
    triggerId: string;
}

export const RowLegendIcoButton: React.FC<IRowLegendIcoButton> = ({
    isVisible,
    isActive,
    onIconClick,
    dialogId,
    triggerId,
}) => {
    const { formatMessage } = useIntl();

    const handleClick = React.useCallback<React.MouseEventHandler>(
        (e) => {
            e.stopPropagation();
            e.preventDefault();
            onIconClick();
        },
        [onIconClick],
    );

    if (!isVisible) {
        return null;
    }

    const iconClasses = cx("legend-popup-button legend-popup-icon s-legend-popup-icon", {
        "legend-popup-icon-active": isActive,
    });
    return (
        <div className="legend-popup-button">
            <Button
                onClick={handleClick}
                className={iconClasses}
                tabIndex={0}
                accessibilityConfig={{
                    isExpanded: isActive,
                    popupId: dialogId,
                    ariaLabel: formatMessage({ id: "properties.legend.more.button" }),
                }}
                id={triggerId}
            >
                <div role={"presentation"}>
                    <Icon.LegendMenu />
                </div>
            </Button>
        </div>
    );
};

export interface IRowLegendProps {
    legendLabel?: string;
    maxRowsCount?: number;
    series: ISeriesItem[];
    enableBorderRadius?: boolean | ItemBorderRadiusPredicate;
    onDialogIconClick: () => void;
    onLegendItemClick: (item: ISeriesItem) => void;
    isActive?: boolean;
    dialogId: string;
    triggerId: string;
}

export const RowLegend: React.FC<IRowLegendProps> = (props) => {
    const {
        series,
        maxRowsCount = 1,
        legendLabel,
        enableBorderRadius,
        onDialogIconClick,
        onLegendItemClick,
        dialogId,
        triggerId,
        isActive = false,
    } = props;
    const [isOverflow, numOfUsedRow, checkOverFlow] = useCheckOverflow();

    const LEGEND_HEIGHT = maxRowsCount * LEGEND_ROW_HEIGHT + LEGEND_TOP_BOTTOM_PADDING;

    const itemsAlign = numOfUsedRow === 1 ? "flex-end" : "flex-start";

    return (
        <div className="legend-popup-row" style={{ maxHeight: LEGEND_HEIGHT }}>
            <LegendSeries
                onToggleItem={onLegendItemClick}
                series={series}
                ref={checkOverFlow}
                style={{
                    justifyContent: itemsAlign,
                }}
                label={legendLabel}
                className={"viz-legend static position-row"}
            >
                <LegendLabelItem label={legendLabel} />
                <LegendList
                    enableBorderRadius={enableBorderRadius}
                    series={series}
                    onItemClick={onLegendItemClick}
                />
            </LegendSeries>
            <RowLegendIcoButton
                isActive={isActive}
                isVisible={isOverflow}
                onIconClick={onDialogIconClick}
                dialogId={dialogId}
                triggerId={triggerId}
            />
        </div>
    );
};
