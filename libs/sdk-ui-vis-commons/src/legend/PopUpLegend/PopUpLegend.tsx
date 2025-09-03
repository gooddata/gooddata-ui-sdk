// (C) 2007-2025 GoodData Corporation
import React, { ReactElement, useState } from "react";

import { useIntl } from "react-intl";

import { useIdPrefixed } from "@gooddata/sdk-ui-kit";

import { LegendDialog } from "./LegendDialog.js";
import { RowLegend } from "./RowLegend.js";
import { ChartFillType } from "../../coloring/types.js";
import { StaticLegend } from "../StaticLegend.js";
import { ISeriesItem, ItemBorderRadiusPredicate } from "../types.js";

const PAGINATION_HEIGHT = 34;

/**
 * @internal
 */
export interface IPopUpLegendProps {
    series: ISeriesItem[];
    onLegendItemClick: (item: ISeriesItem) => void;
    name?: string;
    maxRows?: number;
    enableBorderRadius?: boolean | ItemBorderRadiusPredicate;
    containerId: string;
    customComponent?: ReactElement | null;
    customComponentName?: string;
    chartFill?: ChartFillType;
}

/**
 * @internal
 */
export function PopUpLegend(props: IPopUpLegendProps) {
    const {
        name,
        maxRows,
        enableBorderRadius,
        series,
        onLegendItemClick,
        containerId,
        customComponent,
        customComponentName,
        chartFill,
    } = props;
    const intl = useIntl();
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [page, setPage] = useState(1);

    const dialogTitle =
        (page === 1 && customComponentName) || name || intl.formatMessage({ id: "properties.legend.title" });

    const id = useIdPrefixed("popUpLegend");
    const dialogId = `${id}-dialog`;
    const triggerId = `${id}-trigger`;

    const onCloseDialog = React.useCallback(() => {
        setDialogOpen(false);
        setPage(1);
        document.getElementById(triggerId)?.focus();
    }, [triggerId]);

    return (
        <div data-testid="pop-up-legend">
            <RowLegend
                legendLabel={name}
                maxRowsCount={maxRows}
                series={[...series]}
                onDialogIconClick={() => {
                    setDialogOpen((prevState) => !prevState);
                }}
                onLegendItemClick={onLegendItemClick}
                enableBorderRadius={enableBorderRadius}
                isActive={isDialogOpen}
                dialogId={dialogId}
                triggerId={triggerId}
                chartFill={chartFill}
            />

            <LegendDialog
                name={dialogTitle}
                alignTo={`.${containerId}`}
                isOpen={isDialogOpen}
                onCloseDialog={onCloseDialog}
                id={dialogId}
            >
                <StaticLegend
                    containerHeight={260}
                    series={[...series]}
                    label={name}
                    isLabelVisible={false}
                    position={"dialog"}
                    buttonOrientation={"leftRight"}
                    onItemClick={onLegendItemClick}
                    shouldFillAvailableSpace={false}
                    enableBorderRadius={enableBorderRadius}
                    paginationHeight={PAGINATION_HEIGHT}
                    customComponent={customComponent}
                    onPageChanged={setPage}
                    chartFill={chartFill}
                />
            </LegendDialog>
        </div>
    );
}
