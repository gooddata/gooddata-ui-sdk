// (C) 2026 GoodData Corporation

import { type CSSProperties, memo } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { type IColor, type IColorPalette, type IRgbColorValue } from "@gooddata/sdk-model";
import { type LineStyle } from "@gooddata/sdk-ui-charts";
import {
    Dropdown,
    DropdownList,
    type IAlignPoint,
    Overlay,
    SingleSelectListItem,
} from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { type IChartFillConfig, type PatternFillName } from "@gooddata/sdk-ui-vis-commons";

import { messages } from "../../../../../locales.js";
import { ColorDropdown } from "../colorDropdown/ColorDropdown.js";
import { getIconStyle } from "../colorDropdown/ColorPaletteItem.js";
import { OptionalPatternFill } from "../colorDropdown/OptionalPatternFill.js";

const TOOLBAR_ALIGN_POINTS: IAlignPoint[] = [
    { align: "bl tl", offset: { x: 0, y: 4 } },
    { align: "tl bl", offset: { x: 0, y: -4 } },
];

const DROPDOWN_ALIGN_POINTS: IAlignPoint[] = [
    { align: "bl tl", offset: { x: 0, y: -2 } },
    { align: "tl bl", offset: { x: 0, y: 2 } },
];

const STYLE_DROPDOWN_WIDTH = 120;
const WEIGHT_DROPDOWN_WIDTH = 110;

function StrokeStyleIcon({ style, size = 20 }: { style: LineStyle; size?: number }) {
    const strokeDasharray = style === "dashed" ? "5,2" : style === "dotted" ? "0.5,3" : undefined;
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
            <line
                x1="2"
                y1="10"
                x2="18"
                y2="10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
            />
        </svg>
    );
}

function StrokeWeightIcon({ weight, size = 14 }: { weight: 1 | 2 | 3 | 4; size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden="true">
            <line
                x1="1"
                y1="7"
                x2="13"
                y2="7"
                stroke="currentColor"
                strokeWidth={weight}
                strokeLinecap="round"
            />
        </svg>
    );
}

export interface ILineStyleDialogProps {
    alignTo: HTMLElement | null;
    ignoreClicksOn?: HTMLElement[];
    color: IRgbColorValue;
    colorItem?: IColor;
    colorPalette: IColorPalette;
    lineStyle?: LineStyle;
    lineWidth?: 1 | 2 | 3 | 4;
    disabled?: boolean;
    chartFill?: IChartFillConfig;
    patternFillIndex?: number | PatternFillName;
    onColorSelected: (color: IColor) => void;
    onReset?: () => void;
    onLineStyleChange: (lineStyle: LineStyle) => void;
    onLineWidthChange: (lineWidth: 1 | 2 | 3 | 4) => void;
    onClose: () => void;
}

export const LineStyleDialog = memo(function LineStyleDialog({
    alignTo,
    ignoreClicksOn,
    color,
    colorItem,
    colorPalette,
    lineStyle = "solid",
    lineWidth = 3,
    disabled,
    chartFill,
    patternFillIndex,
    onColorSelected,
    onReset,
    onLineStyleChange,
    onLineWidthChange,
    onClose,
}: ILineStyleDialogProps) {
    const intl = useIntl();
    const theme = useTheme();

    if (!alignTo) {
        return null;
    }

    const { r, g, b } = color;
    const colorSwatchStyle: CSSProperties = getIconStyle(
        chartFill?.type ?? "solid",
        `rgb(${r},${g},${b})`,
        theme,
    );

    const lineStyleOptions: Array<{ id: LineStyle; title: string }> = [
        { id: "solid", title: intl.formatMessage({ id: messages.lineStyleSolid.id }) },
        { id: "dashed", title: intl.formatMessage({ id: messages.lineStyleDashed.id }) },
        { id: "dotted", title: intl.formatMessage({ id: messages.lineStyleDotted.id }) },
    ];

    const lineWidthOptions: Array<{ id: 1 | 2 | 3 | 4; title: string }> = [
        { id: 1, title: intl.formatMessage({ id: messages.lineWidth1.id }) },
        { id: 2, title: intl.formatMessage({ id: messages.lineWidth2.id }) },
        { id: 3, title: intl.formatMessage({ id: messages.lineWidth3.id }) },
        { id: 4, title: intl.formatMessage({ id: messages.lineWidth4.id }) },
    ];

    return (
        <Overlay
            alignTo={alignTo}
            alignPoints={TOOLBAR_ALIGN_POINTS}
            closeOnParentScroll
            closeOnOutsideClick
            ignoreClicksOn={ignoreClicksOn}
            onClose={onClose}
        >
            <div className={cx("gd-line-style-toolbar", { "is-disabled": disabled })}>
                {/* Color */}
                <ColorDropdown
                    selectedColorItem={colorItem}
                    colorPalette={colorPalette}
                    onColorSelected={onColorSelected}
                    onReset={onReset}
                    disabled={disabled}
                    chartFill={chartFill}
                    patternFillIndex={patternFillIndex}
                >
                    <div
                        className={cx("gd-line-style-toolbar__btn", `s-color-${r}-${g}-${b}`, {
                            "is-disabled": disabled,
                        })}
                        aria-label={intl.formatMessage({ id: messages.colors.id })}
                    >
                        <div className="gd-line-style-toolbar__color-swatch" style={colorSwatchStyle}>
                            <OptionalPatternFill
                                chartFill={chartFill?.type ?? "solid"}
                                patternFillIndex={patternFillIndex ?? 0}
                            />
                        </div>
                        <i className="gd-icon-navigatedown" aria-hidden="true" />
                    </div>
                </ColorDropdown>

                <div className="gd-line-style-toolbar__divider" aria-hidden="true" />

                {/* Style */}
                <Dropdown
                    alignPoints={DROPDOWN_ALIGN_POINTS}
                    closeOnParentScroll
                    renderButton={({ isOpen, toggleDropdown }) => (
                        <button
                            type="button"
                            className={cx("gd-line-style-toolbar__btn", { "is-open": isOpen })}
                            onClick={toggleDropdown}
                            disabled={disabled}
                            aria-label={intl.formatMessage({ id: messages.lineStyleLabel.id })}
                            aria-haspopup="listbox"
                            aria-expanded={isOpen}
                        >
                            <StrokeStyleIcon style={lineStyle} />
                            <i className="gd-icon-navigatedown" aria-hidden="true" />
                        </button>
                    )}
                    renderBody={({ closeDropdown }) => (
                        <DropdownList
                            width={STYLE_DROPDOWN_WIDTH}
                            items={lineStyleOptions}
                            renderItem={({ item }) => (
                                <SingleSelectListItem
                                    title={item.title}
                                    icon={<StrokeStyleIcon style={item.id} size={14} />}
                                    isSelected={item.id === lineStyle}
                                    onClick={() => {
                                        onLineStyleChange(item.id);
                                        closeDropdown();
                                    }}
                                />
                            )}
                        />
                    )}
                />

                <div className="gd-line-style-toolbar__divider" aria-hidden="true" />

                {/* Weight */}
                <Dropdown
                    alignPoints={DROPDOWN_ALIGN_POINTS}
                    closeOnParentScroll
                    renderButton={({ isOpen, toggleDropdown }) => (
                        <button
                            type="button"
                            className={cx("gd-line-style-toolbar__btn", { "is-open": isOpen })}
                            onClick={toggleDropdown}
                            disabled={disabled}
                            aria-label={intl.formatMessage({ id: messages.lineWidthLabel.id })}
                            aria-haspopup="listbox"
                            aria-expanded={isOpen}
                        >
                            <span className="gd-line-style-toolbar__weight-text">{lineWidth}px</span>
                            <i className="gd-icon-navigatedown" aria-hidden="true" />
                        </button>
                    )}
                    renderBody={({ closeDropdown }) => (
                        <DropdownList
                            width={WEIGHT_DROPDOWN_WIDTH}
                            items={lineWidthOptions}
                            renderItem={({ item }) => (
                                <SingleSelectListItem
                                    title={item.title}
                                    icon={<StrokeWeightIcon weight={item.id} />}
                                    isSelected={item.id === lineWidth}
                                    onClick={() => {
                                        onLineWidthChange(item.id);
                                        closeDropdown();
                                    }}
                                />
                            )}
                        />
                    )}
                />
            </div>
        </Overlay>
    );
});
