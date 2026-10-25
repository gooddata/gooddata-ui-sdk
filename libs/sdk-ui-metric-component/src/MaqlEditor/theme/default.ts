// (C) 2021-2026 GoodData Corporation

/**
 * @internal
 */
export function createDefaultTheme() {
    const fonts = {
        main: `gdcustomfont, avenir, "Helvetica Neue", arial, sans-serif`,
        indigo: `"Indigo", sans-serif`,
        suggestion: `"Courier", "Courier New", sans-serif`,
        code: `"Courier", "Courier New", sans-serif`,
    };

    const globals = {
        font: fonts.main,
        colors: {
            font: "#464e56",
            shadow: "rgba(20, 56, 93, 0.15)",
            errorLight: "#FCEDEC",
            errorFull: "#E54D40",
            border: "#CCD8E2",
        },
    };

    const content = {
        colors: {
            line: "#e3eaf0",
            lineNumber: "#94a1ad",
            activeLineNumber: "#6a737d",
            slider: "rgba(176, 190, 202, 0.3)",
            sliderHover: "rgba(176, 190, 202, 0.9)",
            bracketMatch: "rgba(254, 244, 186, 1.0)",
        },
        borders: {
            size: 1,
        },
    };

    const suggestion = {
        font: fonts.suggestion,
        colors: {
            line: content.colors.line,
            active: "#6a737d",
            background: "#ffffff",
            selectedBackground: "#ebeff4",
            highlightedBackground: "#fef8d3",
        },
        item: {
            fontSize: 13,
        },
        label: {
            fontSize: 12,
        },
        borders: {
            default: `1px solid ${content.colors.line}`,
        },
        shadow: `0 1px 20px ${globals.colors.shadow}`,
    };

    const detail = {
        colors: {
            border: content.colors.line,
            background: "#ffffff",
            header: "#94a1ad",
        },
        header: {
            size: 40,
            fontSize: 12,
            lineHeight: 18,
            close: {
                font: fonts.indigo,
                size: 11,
            },
        },
        padding: 15,
        closeSize: "11px",
    };

    const statusBar = {
        colors: {
            color: "#94a1ad",
            background: "#ffffff",
        },
        borders: {
            size: 1,
            default: `1px solid ${content.colors.line}`,
        },
    };

    const errorsBar = {
        font: fonts.main,
        sizes: {
            headerFontSize: 12,
            bodyFontSize: 14,
            lineHeight: 18,
        },
        colors: {
            font: "#687581",
            error: globals.colors.errorLight,
            headBackground: "#ffffff",
            bodyBackground: globals.colors.errorLight,
            body: globals.colors.errorFull,
        },
        border: {
            topWidth: 2,
        },
        left: 67,
        paddingVertical: 10,
        paddingHorizontal: 15,
    };

    const hoverBar = {
        font: fonts.main,
        sizes: {
            font: 13,
            borderRadius: 4,
            borderRadiusInner: 3,
        },
        colors: {
            background: "#FFFFFF",
            errorBackground: "rgba(229, 77, 66, 0.1)",
            errorText: globals.colors.errorFull,
        },
        border: `1px solid ${globals.colors.border}`,
        boxShadow: `0 1px 9px ${globals.colors.shadow}`,
        margin: 10,
        padding: "4px 8px",
    };

    const tooltip = {
        colors: {
            background: "#ffffff",
            hover: "#129CC6",
            line: content.colors.line,
        },
        borders: {
            size: 1,
            default: `1px solid ${content.colors.line}`,
        },
        borderRadius: "5px",
    };

    const decorator = {
        paddingTop: "0",
        paddingBottom: "2px",
        fontWeight: "normal",
        borderRadius: "5px",
    };

    const hoverMetric = {
        lineHeight: 18,
        padding: 15,
        space: 10,
        tooltip: {
            normal: {
                minWidth: 250,
                maxWidth: 450,
                maxHeight: 200,
            },
            expanded: {
                minWidth: 450,
                maxWidth: 700,
                maxHeight: 600,
                maxHeightDescription: 150,
            },
        },
        title: {
            bottomSpace: 5,
            fontSize: 14,
        },
        description: {
            fontSize: 12,
        },
        readMore: {
            paddingText: 5,
        },
        colors: {
            color: "#94a1ad",
            hover: "rgba(0,166,125,0.07)",
            border: content.colors.line,
            link: "#464E56",
        },
    };

    const doc = {
        font: fonts.main,
        colors: {
            main: "#000000",
        },
        h1: {
            fontSize: 17,
            lineHeight: 23,
        },
        h1p: {
            fontSize: 14,
            lineHeight: 21,
            color: "#464e56",
        },
        h2: {
            fontSize: 14,
            lineHeight: 21,
        },
        h3: {
            fontSize: 11,
            lineHeight: 18,
            color: "#94a1ad",
        },
        p: {
            fontSize: 12,
            lineHeight: 18,
            color: "#464e56",
        },
        code: {
            font: fonts.code,
            fontSize: 12,
            lineHeight: 18,
            color: "#464e56",
        },
        smallPadding: 10,
        bigPadding: 15,
    };

    return {
        globals,
        content,
        suggestion,
        detail,
        statusBar,
        errorsBar,
        tooltip,
        hoverBar,
        hoverMetric,
        decorator,
        doc,
    };
}

/**
 * @internal
 */
export type MaqlEditorDefaultTheme = ReturnType<typeof createDefaultTheme>;
export function defaultTheme(): MaqlEditorDefaultTheme {
    return createDefaultTheme();
}
