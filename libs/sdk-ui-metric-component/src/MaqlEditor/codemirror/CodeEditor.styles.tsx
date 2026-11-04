// (C) 2021-2026 GoodData Corporation

import { useMemo } from "react";

import { type CSSInterpolation, GlobalStyles } from "tss-react";

import { type IMaqlCodeTheme } from "../hooks/useCodeTheme.js";
import { makeStyles } from "../theme/styles.js";

import { NBSP_CLASS } from "./baseExtensions.js";

const useStyles = makeStyles()(() => ({}));

/**
 * @internal
 */
export interface IMaqlEditorIcon {
    base64: string;
    width?: number;
    height?: number;
}

/**
 * @internal
 */
export interface IMaqlEditorIcons {
    fact?: IMaqlEditorIcon;
    metric?: IMaqlEditorIcon;
    dataset?: IMaqlEditorIcon;
    label?: IMaqlEditorIcon;
    attribute?: IMaqlEditorIcon;
    keyword?: IMaqlEditorIcon;
    function?: IMaqlEditorIcon;
    operator?: IMaqlEditorIcon;
    snippet?: IMaqlEditorIcon;
    value?: IMaqlEditorIcon;
    detail?: IMaqlEditorIcon;
    next?: IMaqlEditorIcon;
    prev?: IMaqlEditorIcon;
    close?: IMaqlEditorIcon;
}

export const DecoratorHovered = "hovered-decorator";
export const DecoratorClassName = "decorator";
export const DecoratorItemClassName = "decorator-item";

type Decorators = {
    [key: string]: {
        decoratorItem: Array<string>;
        decorator: Array<string>;
    };
};
export const DecoratorFact = "fact";
export const DecoratorAttribute = "attribute";
export const DecoratorDateAttribute = "dateAttribute";
export const DecoratorComputedAttribute = "computedAttribute";
export const DecoratorLabel = "label";
export const DecoratorDateLabel = "dateLabel";
export const DecoratorMetric = "metric";
export const DecoratorDataset = "dataset";
export const DecoratorParameter = "parameter";
export const Decorators: Decorators = {
    [DecoratorFact]: {
        decoratorItem: [DecoratorItemClassName, DecoratorFact],
        decorator: [DecoratorClassName, DecoratorFact],
    },
    [DecoratorAttribute]: {
        decoratorItem: [DecoratorItemClassName, DecoratorAttribute],
        decorator: [DecoratorClassName, DecoratorAttribute],
    },
    [DecoratorDateAttribute]: {
        decoratorItem: [DecoratorItemClassName, DecoratorDateAttribute],
        decorator: [DecoratorClassName, DecoratorDateAttribute],
    },
    [DecoratorComputedAttribute]: {
        decoratorItem: [DecoratorItemClassName, DecoratorComputedAttribute],
        decorator: [DecoratorClassName, DecoratorComputedAttribute],
    },
    [DecoratorLabel]: {
        decoratorItem: [DecoratorItemClassName, DecoratorLabel],
        decorator: [DecoratorClassName, DecoratorLabel],
    },
    [DecoratorDateLabel]: {
        decoratorItem: [DecoratorItemClassName, DecoratorDateLabel],
        decorator: [DecoratorClassName, DecoratorDateLabel],
    },
    [DecoratorMetric]: {
        decoratorItem: [DecoratorItemClassName, DecoratorMetric],
        decorator: [DecoratorClassName, DecoratorMetric],
    },
    [DecoratorDataset]: {
        decoratorItem: [DecoratorItemClassName, DecoratorDataset],
        decorator: [DecoratorClassName, DecoratorDataset],
    },
    [DecoratorParameter]: {
        decoratorItem: [DecoratorItemClassName, DecoratorParameter],
        decorator: [DecoratorClassName, DecoratorParameter],
    },
    default: {
        decoratorItem: [DecoratorItemClassName, "unknown"],
        decorator: [DecoratorClassName, "unknown"],
    },
};

/**
 * Class prefix of the syntax tokens, see maqlLanguage.
 */
export const TOKEN_CLASS_PREFIX = "maql-token-";
/**
 * Class prefix of the semantic tokens the language service reports, see semanticTokens.
 */
export const SEMANTIC_TOKEN_CLASS_PREFIX = "maql-semantic-";
/**
 * Class of the completion tooltip, so its styles do not leak into other CodeMirror editors.
 */
export const SUGGEST_CLASS = "maql-suggest";
/**
 * Class of the widget that shows the diagnostic the user navigated to.
 */
export const DIAGNOSTIC_WIDGET_CLASS = "maql-diagnostic-widget";
/**
 * Class of the hover tooltip with the language service's markdown.
 */
export const HOVER_CLASS = "maql-hover";
/**
 * Class of the rendered completion documentation.
 */
export const DOCS_CLASS = "docs";
/**
 * Class of the documentation pane of a suggestion: the item detail, a close button, the docs.
 */
export const DOCS_PANE_CLASS = "maql-docs";
/**
 * Class of the `?` button on the selected suggestion that shows and hides the documentation.
 */
export const DOCS_TOGGLE_CLASS = "maql-docs-toggle";
/**
 * Class on the editor while the documentation of the suggestions is shown.
 */
export const DOCS_OPEN_CLASS = "maql-docs-open";

/**
 * Class of the type of a suggested object, shown after its label.
 */
export const TYPE_LABEL_CLASS = "maql-suggest-type";

const COMPLETION_ICON_TYPES: Array<keyof IMaqlEditorIcons> = [
    "fact",
    "metric",
    "dataset",
    "label",
    "attribute",
    "keyword",
    "function",
    "operator",
    "snippet",
    "value",
];

const ICON_STROKE = "#464e56";

function svgIcon(content: string): IMaqlEditorIcon {
    const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" ` +
        `stroke="${ICON_STROKE}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${content}</svg>`;
    return { base64: btoa(svg), width: 16, height: 16 };
}

/**
 * Icons of the suggestion types the host does not supply: Monaco drew these from its own icon font.
 */
const DEFAULT_ICONS: Pick<IMaqlEditorIcons, "operator" | "snippet" | "value"> = {
    // + − × ÷
    operator: svgIcon(
        '<path d="M4.5 2v5M2 4.5h5M9 4.5h5M2.75 9.75l3.5 3.5M6.25 9.75l-3.5 3.5M9 11.5h5M11.5 9.4v.01M11.5 13.6v.01"/>',
    ),
    // a box with a dashed bottom edge
    snippet: svgIcon(
        '<path d="M3.5 2.5h9a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5M2 12V4a1.5 1.5 0 0 1 1.5-1.5' +
            'M2 12a1.5 1.5 0 0 0 1.5 1.5M5.5 13.5h1.5M9 13.5h1.5"/>',
    ),
    // a box with an equals sign
    value: svgIcon('<rect x="2" y="3" width="12" height="10" rx="1.5"/><path d="M5 6.5h6M5 9.5h6"/>'),
};

export function CodeEditorStyles({
    id,
    icons,
    codeTheme,
    inline,
}: {
    id: string;
    icons?: IMaqlEditorIcons;
    codeTheme?: IMaqlCodeTheme;
    inline: boolean;
}) {
    const styles = useCodeEditorStyles(id, inline, icons, codeTheme);

    return <GlobalStyles styles={styles} />;
}

const linePaddingLeft = 16;
const SUGGEST_WIDTH = 430;

function useCodeEditorStyles(
    id: string,
    inline: boolean,
    icons?: IMaqlEditorIcons,
    codeTheme?: IMaqlCodeTheme,
) {
    const { theme } = useStyles();

    return useMemo<CSSInterpolation>(() => {
        const fontSize = inline ? 12 : 14;
        const lineHeight = inline ? 18 : 22;
        const paddingVertical = inline ? 10 : 15;

        const editor: Record<string, CSSInterpolation> = {
            height: inline ? "auto" : "100%",
            background: codeTheme?.background ?? "transparent",
            fontFamily: "monospace",
            fontSize: `${fontSize}px`,

            "&.cm-focused": {
                outline: "none",
            },
            ".cm-scroller": {
                fontFamily: "monospace",
                lineHeight: `${lineHeight}px`,
                overflow: "auto",
            },
            ".cm-content": {
                padding: `${paddingVertical}px 0 ${paddingVertical}px ${linePaddingLeft}px`,
                // The content fills the editor, so a click anywhere in it focuses the editor, the
                // way the Monaco text area did. An inline editor is as tall as its code.
                minHeight: inline ? `${lineHeight}px` : "100%",
            },
            ".cm-line": {
                padding: 0,
            },
            ".cm-gutters": {
                background: "transparent",
                border: "none",
                color: theme.content.colors.lineNumber,
            },
            ".cm-lineNumbers .cm-gutterElement": {
                minWidth: "4ch",
                padding: "0 8px 0 16px",
            },
            ".cm-activeLineGutter": {
                background: "transparent",
                color: theme.content.colors.activeLineNumber,
            },
            ".cm-matchingBracket, &.cm-focused .cm-matchingBracket": {
                backgroundColor: theme.content.colors.bracketMatch,
                outline: "none",
            },
            // The find and replace panel, where Monaco's find widget was.
            ".cm-panels": {
                borderBottom: `1px solid ${theme.content.colors.line}`,
                background: theme.suggestion.colors.background,
                fontFamily: theme.globals.font,
                fontSize: "12px",
                color: theme.globals.colors.font,
            },
            ".cm-panel.cm-search": {
                padding: "5px 10px",
                ".cm-textfield": {
                    border: `1px solid ${theme.globals.colors.border}`,
                    borderRadius: "3px",
                    background: "#fff",
                    fontSize: "12px",
                },
                ".cm-button": {
                    border: `1px solid ${theme.globals.colors.border}`,
                    borderRadius: "3px",
                    background: "#fff",
                    backgroundImage: "none",
                    fontSize: "12px",
                    cursor: "pointer",
                },
                ".cm-button:hover": {
                    background: theme.suggestion.colors.selectedBackground,
                },
                label: {
                    marginRight: "8px",
                },
            },
            ".cm-searchMatch": {
                backgroundColor: "rgba(234, 92, 0, 0.33)",
            },
            ".cm-searchMatch.cm-searchMatch-selected": {
                backgroundColor: "#a8ac94",
            },
            ".cm-selectionMatch": {
                backgroundColor: "rgba(173, 214, 255, 0.5)",
            },
        };

        const tokens = Object.entries(codeTheme?.tokens ?? {}).reduce(
            (prev, [type, color]) => {
                prev[`.${TOKEN_CLASS_PREFIX}${type}`] = { color };
                return prev;
            },
            {} as Record<string, CSSInterpolation>,
        );
        // The semantic tokens come from the parser of the language service and win over the
        // regular-expression tokens, so they are declared after them.
        const semanticTokens = Object.entries(codeTheme?.tokens ?? {}).reduce(
            (prev, [type, color]) => {
                prev[`.${SEMANTIC_TOKEN_CLASS_PREFIX}${type}`] = { color };
                return prev;
            },
            {} as Record<string, CSSInterpolation>,
        );

        const decorators = Object.keys(Decorators).reduce(
            (prev, name) => {
                const item = Decorators[name];
                const colors = codeTheme?.decorators[name];
                prev[`.${item.decorator.join(".")}`] = {
                    background: colors?.background ?? "#cecece",
                    color: colors?.color ?? "#7e7e7e",
                    ...(theme.decorator as { [key: string]: CSSInterpolation }),
                };
                prev[`.${item.decoratorItem.join(".")}`] = {
                    color: colors?.color ?? "#000000",
                };
                return prev;
            },
            {} as { [key: string]: CSSInterpolation },
        );

        const hoverDecorator = {
            [`.${DecoratorHovered}`]: {
                background: `${theme.hoverMetric.colors.hover} !important`,
                ...(theme.decorator as { [key: string]: CSSInterpolation }),
            },
        };

        const allIcons: IMaqlEditorIcons = { ...DEFAULT_ICONS, ...icons };
        const completionIcons = COMPLETION_ICON_TYPES.reduce(
            (prev, type) => {
                const icon = allIcons[type];
                if (icon) {
                    prev[`.cm-completionIcon-${type}`] = {
                        "&::after": {
                            content: '""',
                            display: "block",
                            ...createIconDefinition(icon),
                        },
                    };
                }
                return prev;
            },
            {} as Record<string, CSSInterpolation>,
        );

        const suggestionWidget = {
            [`.cm-tooltip.cm-tooltip-autocomplete.${SUGGEST_CLASS}`]: {
                boxShadow: theme.suggestion.shadow,
                border: theme.suggestion.borders.default,
                background: theme.suggestion.colors.background,

                "& > ul": {
                    fontFamily: theme.suggestion.font,
                    fontSize: `${theme.suggestion.item.fontSize}px`,
                    // The width of the Monaco suggest widget; long details are cut, not the list widened.
                    width: `${SUGGEST_WIDTH}px`,
                    maxWidth: `${SUGGEST_WIDTH}px`,
                    maxHeight: "260px",

                    "& > li": {
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        padding: "0 30px 0 10px",
                        lineHeight: "22px",
                        color: theme.globals.colors.font,
                        background: theme.suggestion.colors.background,

                        "&[aria-selected], &:hover": {
                            background: theme.suggestion.colors.selectedBackground,
                            color: theme.globals.colors.font,
                        },

                        [`.${DOCS_TOGGLE_CLASS}`]: {
                            display: "none",
                            position: "absolute",
                            top: "50%",
                            right: "8px",
                            transform: "translateY(-50%)",
                            width: "16px",
                            height: "16px",
                            padding: 0,
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            fontFamily: theme.globals.font,
                            fontSize: "12px",
                            lineHeight: "16px",
                            color: theme.detail.colors.header,
                            ...iconButton(icons?.detail),
                        },
                        [`&[aria-selected] .${DOCS_TOGGLE_CLASS}`]: {
                            display: "block",
                        },
                        // Monaco shows the detail of the selected row only.
                        "&[aria-selected] .cm-completionDetail": {
                            display: "block",
                        },
                    },
                },
                ".cm-completionIcon": {
                    flex: "0 0 auto",
                    width: "18px",
                    marginRight: "5px",
                    opacity: 1,
                    display: "inline-flex",
                    alignItems: "center",
                    verticalAlign: "middle",
                    fontSize: "100%",
                },
                ".cm-completionLabel": {
                    flex: "0 1 auto",
                    minWidth: "40%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                },
                [`.${TYPE_LABEL_CLASS}`]: {
                    flex: "0 0 auto",
                    marginLeft: "8px",
                    whiteSpace: "nowrap",
                    fontSize: `${theme.suggestion.label.fontSize}px`,
                    color: theme.suggestion.colors.active,
                },
                ".cm-completionMatchedText": {
                    textDecoration: "none",
                    background: theme.suggestion.colors.highlightedBackground,
                    color: theme.globals.colors.font,
                },
                ".cm-completionDetail": {
                    display: "none",
                    flex: "1 1 0",
                    minWidth: 0,
                    marginLeft: "20px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    textAlign: "right",
                    fontStyle: "normal",
                    fontSize: `${theme.suggestion.label.fontSize}px`,
                    fontFamily: theme.globals.font,
                    color: theme.suggestion.colors.active,
                },
                ...completionIcons,
            },
            // The open documentation pane repeats the detail in its header.
            [`&.${DOCS_OPEN_CLASS} .cm-tooltip.cm-tooltip-autocomplete.${SUGGEST_CLASS} > ul > li[aria-selected] .cm-completionDetail`]:
                {
                    display: "none",
                },
        };

        const suggestionsDetails = {
            ".cm-tooltip.cm-completionInfo": {
                fontFamily: theme.globals.font,
                minHeight: `${2 * theme.detail.padding + theme.detail.header.size}px`,
                border: `1px solid ${theme.detail.colors.border}`,
                boxShadow: `0 1px 20px ${theme.globals.colors.shadow}`,
                color: theme.globals.colors.font,
                background: theme.detail.colors.background,
                padding: `${theme.detail.padding}px`,
                width: "400px",
                maxHeight: "400px",
                overflow: "auto",
                // CodeMirror keeps the line breaks of plain-text info; this one is markup.
                whiteSpace: "normal",
                // Laid out and placed at once, shown when the user asks for it, see maqlCompletion.
                visibility: "hidden",
            },
            [`&.${DOCS_OPEN_CLASS} .cm-tooltip.cm-completionInfo`]: {
                visibility: "visible",
            },
            [`.${DOCS_PANE_CLASS}`]: {
                ".header": {
                    position: "relative",
                    minHeight: `${theme.detail.header.lineHeight}px`,
                    paddingRight: `${theme.detail.padding * 2}px`,
                    fontFamily: theme.suggestion.font,
                    fontSize: `${theme.detail.header.fontSize}px`,
                    lineHeight: `${theme.detail.header.lineHeight}px`,
                    color: theme.detail.colors.header,

                    p: {
                        margin: 0,
                        padding: 0,
                    },
                    ".close": {
                        position: "absolute",
                        top: 0,
                        right: 0,
                        width: "16px",
                        height: "16px",
                        padding: 0,
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        fontFamily: theme.detail.header.close.font,
                        fontSize: `${theme.detail.header.close.size}px`,
                        lineHeight: "16px",
                        color: theme.detail.colors.header,
                        ...iconButton(icons?.close),
                    },
                },
                [`.header + .${DOCS_CLASS}`]: {
                    marginTop: `${theme.detail.padding}px`,
                },
            },
        };

        const diagnostics = {
            // A diagnostic without extent gets no mark, the way Monaco drew no squiggle for it; it
            // still shows on navigation.
            ".cm-lintPoint": {
                display: "none",
            },
            // The diagnostics of the hovered code, a section of the hover tooltip.
            ".cm-tooltip-lint": {
                ".cm-diagnostic": {
                    borderLeft: "none",
                    margin: theme.hoverBar.margin,
                    padding: theme.hoverBar.padding,
                    borderRadius: theme.hoverBar.sizes.borderRadiusInner,
                    fontSize: `${theme.hoverBar.sizes.font}px`,
                    whiteSpace: "normal",
                },
                ".cm-diagnostic-error": {
                    background: theme.hoverBar.colors.errorBackground,
                    color: theme.hoverBar.colors.errorText,
                },
                ".cm-diagnosticText": {
                    // A block, so its first letter can be capitalised.
                    display: "inline-block",

                    "&::first-letter": {
                        textTransform: "uppercase",
                    },
                },
                ".cm-diagnosticSource": {
                    display: "inline",
                    marginLeft: "6px",
                    fontSize: "inherit",
                    opacity: 0.7,
                },
            },
            [`.cm-tooltip.${DIAGNOSTIC_WIDGET_CLASS}`]: {
                border: "none",
                borderTop: `${theme.errorsBar.border.topWidth}px solid ${theme.errorsBar.colors.error}`,
                background: theme.errorsBar.colors.bodyBackground,
                padding: `${theme.errorsBar.paddingVertical}px ${theme.errorsBar.paddingHorizontal}px`,
                maxWidth: "calc(100% - 32px)",

                ".message": {
                    fontFamily: theme.errorsBar.font,
                    fontSize: `${theme.errorsBar.sizes.bodyFontSize}px`,
                    lineHeight: `${theme.errorsBar.sizes.lineHeight}px`,
                    color: theme.errorsBar.colors.body,

                    "&::first-letter": {
                        textTransform: "uppercase",
                    },
                },
            },
        };

        const hover = {
            // The host of the hover tooltips: diagnostics and the language service's markdown.
            ".cm-tooltip.cm-tooltip-hover": {
                border: theme.hoverBar.border,
                borderRadius: theme.hoverBar.sizes.borderRadius,
                background: theme.hoverBar.colors.background,
                boxShadow: theme.hoverBar.boxShadow,
                fontFamily: theme.hoverBar.font,
                fontSize: `${theme.hoverBar.sizes.font}px`,
                color: theme.globals.colors.font,
                maxWidth: "500px",
            },
            [`.cm-tooltip.cm-tooltip-hover .${HOVER_CLASS}`]: {
                padding: theme.hoverBar.padding,
            },
            [`.${NBSP_CLASS}`]: {
                boxShadow: `inset 0 0 0 1px ${theme.globals.colors.errorFull}`,
                borderRadius: "2px",
            },
        };

        return {
            [`#${id} .cm-editor`]: {
                ...editor,
                ...tokens,
                ...semanticTokens,
                ...decorators,
                ...hoverDecorator,
                ...suggestionWidget,
                ...suggestionsDetails,
                ...diagnostics,
                ...hover,
            } as CSSInterpolation,
        };
    }, [id, inline, icons, codeTheme, theme]);
}

/**
 * A button that shows the icon in place of its text, when the host supplies one.
 */
function iconButton(icon?: IMaqlEditorIcon | null): { [key: string]: CSSInterpolation } {
    if (!icon) {
        return {};
    }
    return {
        fontSize: 0,
        color: "transparent",
        ...createIconDefinition(icon),
    };
}

function createIconDefinition(icon?: IMaqlEditorIcon | null) {
    const def: { [key: string]: CSSInterpolation } = {};

    if (icon) {
        def["backgroundImage"] = `url("data:image/svg+xml;base64,${icon.base64}")`;
        def["backgroundRepeat"] = "no-repeat";
        def["backgroundPosition"] = "center";

        if (icon.width) {
            def["width"] = `${icon.width}px`;
        }
        if (icon.height) {
            def["height"] = `${icon.height}px`;
        }
    }
    return def;
}
