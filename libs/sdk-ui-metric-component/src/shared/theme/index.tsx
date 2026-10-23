// (C) 2021-2026 GoodData Corporation

import { type CSSObject, createMakeStyles } from "tss-react";

function useTheme() {
    const defaultWhite = "#FFFFFF";
    const defaultText = "#464e56";
    const defaultBorder = "#dde4eb";
    const defaultBorderDarker = "#CCD8E2";
    const defaultSeparator = "#DEE4EA";
    const defaultStateBlank = "#94a1ad";
    const defaultGreyedText = "#6a737d";
    const editorBackground = "#fcfcfd";
    const description = "#6a737d";
    const line = "#e3eaf0";
    const dropdownButton = "#94a1ad";
    const dropdownButtonHover = "#464e56";
    const dropdownButtonMoreHover = "#dadfe6";
    const dropdownHeaderBackground = "#EBEFF4";
    const editableRowHover = "#d5dfe7";
    const placeholder = "#94a1ad";
    const maqlKeyword = "#7364cf";
    const metric = "#00A67D";
    const fact = "#00A67D";
    const attribute = "#DB7900";
    const dataset = "#952F8E";
    const parameter = "#94A1AD";
    const comment = "#94A1AD";
    const value = "#D95791";
    const active = "#05A2D2";
    const dirty = "#4FB0DD";
    const tabContrast = "#14B2E2";
    const negative = "#e54d42";
    const warning = "#e17b1a";
    const title = "#96A1AC";
    const minimizedEditingTitle = "#6a737d";
    const subtitle = "#687581";
    const communityColor = "#14B2E2";
    const communityBackground = "rgba(20,178,226,0.3)";
    const disabled = "#B0BECA";
    const createHover = "#129CC6";
    const negativeBackground = "#fff3f2";

    const spinner: CSSObject = {
        position: "absolute",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
    };

    const fonts = {
        main: `gdcustomfont, avenir, "Helvetica Neue", arial, sans-serif;`,
        placeholder: "monospace",
    };

    const normalItemStyle = {
        fontWeight: 700,
        fontSize: 20,
        padding: "3px 4px",
        background: "transparent",
        borderRadius: 0,
        outline: 0,
        height: 32,
        lineHeight: "26px",
        display: "block",
    };

    const smallItemStyle = {
        fontSize: 14,
        fontWeight: 400,
        lineHeight: "21px",
        height: "auto",
    };

    const metricList = {
        itemSize: 43,
        padding: 15,
    };

    const community = {
        color: communityColor,
        background: communityBackground,
    };

    const globals = {
        font: fonts.main,
        colors: {
            title,
            subtitle,
            description,
            defaultWhite,
            defaultText,
            defaultGreyedText,
            defaultStateBlank,
            defaultBorder,
            defaultBorderDarker,
            dropdownButton,
            dropdownButtonHover,
            dropdownButtonMoreHover,
            dropdownHeaderBackground,
            editorBackground,
            editableRowHover,
            line,
            placeholder,
            white: `var(--gd-palette-complementary-0, ${defaultWhite})`,
            border: `var(--gd-palette-complementary-3, ${defaultBorder})`,
            link: "var(--gd-palette-complementary-7)",
            //tokens
            maqlKeyword,
            metric,
            fact,
            attribute,
            dataset,
            parameter,
            comment,
            value,
            active,
            negative,
            negativeBackground,
            warning,
        },
        spinner,
        normalItemStyle,
        smallItemStyle,
        metricList,
        community,
    };

    const preview = {
        colors: {
            text: defaultText,
            default: defaultStateBlank,
            create: tabContrast,
            hover: createHover,
        },
    };

    const tabs = {
        colors: {
            border: defaultBorderDarker,
            active: active,
            divider: line,
            dirty: dirty,
            background: defaultWhite,
            negative: negative,
            separator: defaultSeparator,
            normal: subtitle,
            create: tabContrast,
            hover: createHover,
            placeholder,
            arrow: defaultStateBlank,
            disabled,
        },
        sizes: {
            arrowButtonWidth: 30,
            controlsDividerWidth: 1,
            controlsDividerMargin: 6,
            buttonMargin: 8,
            flag: 5,
            space: 8,
            tabsPadding: 5,
            tabLastDivider: 3,
            tabBorderRadius: 4,
        },
        lineHeight: {
            close: 12,
            title: 23,
        },
        fontSize: {
            title: 12,
        },
    };

    const minimize = {
        boxShadow: `0px 2px 10px rgba(0, 0, 0, 0.1)`,
        colors: {
            editing: minimizedEditingTitle,
            count: subtitle,
            border: defaultBorderDarker,
            divider: line,
            background: defaultWhite,
        },
        sizes: {
            borderRadius: 4,
            gap: 9,
            countsMinWidth: 60,
            button: 24,
        },
        lineHeight: {
            text: 23,
        },
        fontSize: {
            text: 12,
        },
    };

    return {
        fonts,
        globals,
        tabs,
        preview,
        minimize,
    };
}

export type DefaultTheme = ReturnType<typeof useTheme>;
export const { makeStyles } = createMakeStyles({ useTheme });
