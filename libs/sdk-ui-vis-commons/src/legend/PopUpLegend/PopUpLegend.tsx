// (C) 2007-2021 GoodData Corporation
import React, { useState } from "react";
import { useIntl } from "react-intl";

import { StaticLegend } from "../StaticLegend";
import { IPushpinCategoryLegendItem, ItemBorderRadiusPredicate } from "../types";

import { LegendDialog } from "./LegendDialog";
import { RowLegend } from "./RowLegend";

const PAGINATION_HEIGHT = 34;

export interface IPopUpLegendProps {
    series: IPushpinCategoryLegendItem[];
    onLegendItemClick: (item: IPushpinCategoryLegendItem) => void;
    name?: string;
    maxRows?: number;
    enableBorderRadius?: boolean | ItemBorderRadiusPredicate;
    containerId: string;
}

export const PopUpLegend: React.FC<IPopUpLegendProps> = (props) => {
    const { name, maxRows, enableBorderRadius, series, onLegendItemClick, containerId } = props;
    const intl = useIntl();
    const [isDialogOpen, setDialogOpen] = useState(false);

    const dialogTitle = name || intl.formatMessage({ id: "properties.legend.title" });

    const onCloseDialog = () => setDialogOpen(false);

    return (
        <div>
            <RowLegend
                legendLabel={name}
                maxRowsCount={maxRows}
                series={[...series]}
                onDialogIconClick={() => {
                    setDialogOpen((prevState) => !prevState);
                }}
                onLegendItemClick={onLegendItemClick}
                enableBorderRadius={enableBorderRadius}
            />

            <LegendDialog
                name={dialogTitle}
                alignTo={`.${containerId}`}
                isOpen={isDialogOpen}
                onCloseDialog={onCloseDialog}
            >
                <StaticLegend
                    containerHeight={260}
                    series={[...series]}
                    position={"dialog"}
                    buttonOrientation={"leftRight"}
                    onItemClick={onLegendItemClick}
                    shouldFillAvailableSpace={false}
                    enableBorderRadius={enableBorderRadius}
                    paginationHeight={PAGINATION_HEIGHT}
                />
            </LegendDialog>
        </div>
    );
};
