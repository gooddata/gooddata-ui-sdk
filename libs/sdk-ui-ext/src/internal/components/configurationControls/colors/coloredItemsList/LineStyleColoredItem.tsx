// (C) 2026 GoodData Corporation

import { memo, useRef, useState } from "react";

import { useIntl } from "react-intl";

import { type IColor, type IColorPalette } from "@gooddata/sdk-model";
import { getMappingHeaderFormattedName } from "@gooddata/sdk-ui";
import { type IChartFillConfig, type LineStyle } from "@gooddata/sdk-ui-charts";
import { type PatternFillName } from "@gooddata/sdk-ui-vis-commons";

import { messages } from "../../../../../locales.js";
import { type IColoredItem } from "../../../../interfaces/Colors.js";
import { getTranslation } from "../../../../utils/translations.js";
import { IconPosition } from "../colorDropdown/ColorDropdown.js";

import { ColoredItemContent } from "./ColoredItemContent.js";
import { LineStyleDialog } from "./LineStyleDialog.js";

export interface ILineStyleColoredItemProps {
    colorPalette: IColorPalette;
    item: IColoredItem;
    onSelect?: (source: IColoredItem, color: IColor) => void;
    disabled?: boolean;
    chartFill?: IChartFillConfig;
    patternFillIndex?: number | PatternFillName;
    onLineStyleChange?: (item: IColoredItem, lineStyle: LineStyle) => void;
    onLineWidthChange?: (item: IColoredItem, lineWidth: 1 | 2 | 3 | 4) => void;
}

export const LineStyleColoredItem = memo(function LineStyleColoredItem(props: ILineStyleColoredItemProps) {
    const intl = useIntl();
    const {
        item,
        colorPalette,
        onSelect,
        chartFill,
        patternFillIndex,
        disabled,
        onLineStyleChange,
        onLineWidthChange,
    } = props;

    const anchorRef = useRef<HTMLButtonElement>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const headerText =
        getMappingHeaderFormattedName(item.mappingHeader) || `(${getTranslation("empty_value", intl)})`;

    const onColorSelected = (color: IColor) => onSelect?.(item, color);

    return (
        <>
            <button
                ref={anchorRef}
                type="button"
                className="gd-line-style-item-trigger"
                aria-haspopup="dialog"
                aria-expanded={dialogOpen}
                aria-label={getTranslation(messages.lineStyleTriggerAriaLabel.id, intl, {
                    name: headerText,
                })}
                onClick={() => setDialogOpen((v) => !v)}
                disabled={disabled}
            >
                <ColoredItemContent
                    text={headerText}
                    color={item.color}
                    chartFill={chartFill?.type}
                    patternFillIndex={patternFillIndex}
                    isSelected={dialogOpen}
                    position={IconPosition.Down}
                />
            </button>
            {dialogOpen ? (
                <LineStyleDialog
                    alignTo={anchorRef.current}
                    ignoreClicksOn={anchorRef.current ? [anchorRef.current] : undefined}
                    color={item.color}
                    colorItem={item.colorItem}
                    colorPalette={colorPalette}
                    lineStyle={item.lineStyle}
                    lineWidth={item.lineWidth}
                    disabled={disabled}
                    chartFill={chartFill}
                    patternFillIndex={patternFillIndex}
                    onColorSelected={onColorSelected}
                    onLineStyleChange={(lineStyle) => onLineStyleChange?.(item, lineStyle)}
                    onLineWidthChange={(lineWidth) => onLineWidthChange?.(item, lineWidth)}
                    onClose={() => setDialogOpen(false)}
                />
            ) : null}
        </>
    );
});
