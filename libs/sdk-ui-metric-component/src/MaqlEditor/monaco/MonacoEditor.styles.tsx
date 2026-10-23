// (C) 2021-2026 GoodData Corporation

import { useMemo } from "react";

import type * as monaco from "monaco-editor/editor/editor.api.js";
import { type CSSInterpolation, GlobalStyles } from "tss-react";

import { makeStyles } from "../theme/styles.js";

//more info in README.md
import { type IStandaloneEditorConstructionOptions } from "./MonacoEditor.js";

const useStyles = makeStyles()(() => ({}));

export interface IMaqlEditorIcon {
    base64: string;
    width?: number;
    height?: number;
}

export interface IMaqlEditorIcons {
    fact?: IMaqlEditorIcon;
    metric?: IMaqlEditorIcon;
    dataset?: IMaqlEditorIcon;
    label?: IMaqlEditorIcon;
    attribute?: IMaqlEditorIcon;
    keyword?: IMaqlEditorIcon;
    function?: IMaqlEditorIcon;
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

export function MonacoStyles({
    id,
    icons,
    themeData,
    options = {},
}: {
    id: string;
    icons?: IMaqlEditorIcons;
    themeData?: monaco.editor.IStandaloneThemeData;
    options?: Partial<IStandaloneEditorConstructionOptions>;
}) {
    const styles = useMonacoStyles(id, options, icons, themeData);

    return <GlobalStyles styles={styles} />;
}

const linePaddingLeft = 16;

function useMonacoStyles(
    id: string,
    _options: Partial<IStandaloneEditorConstructionOptions>,
    icons?: IMaqlEditorIcons,
    themeData?: monaco.editor.IStandaloneThemeData,
) {
    const { theme } = useStyles();
    return useMemo<CSSInterpolation>(() => {
        const customIcon = {
            display: "block",
        };

        const editorLines = {
            ".lines-content": {
                paddingLeft: `${linePaddingLeft}px`,
            },
            textarea: {
                marginLeft: `${linePaddingLeft + 1}px`,
            },
        };

        const editor = {
            ".bracket-match": {
                backgroundColor: theme.content.colors.bracketMatch,
                border: "none",
            },
            ".monaco-scrollable-element": {
                borderLeft: "none",
            },
            ".line-numbers": {
                color: theme.content.colors.lineNumber,
            },
            ".active-line-number.line-numbers": {
                color: theme.content.colors.activeLineNumber,
            },
            ".monaco-scrollable-element > .scrollbar > .slider ": {
                background: theme.content.colors.slider,

                "&:hover": {
                    background: theme.content.colors.sliderHover,
                },
            },
            ".codicon-folding-expanded, .codicon-folding-collapsed": {
                width: "16px !important",
                height: "16px !important",
                margin: "3px 0 !important",
                fontSize: "100%",
            },
            ...editorLines,
        };

        const suggestionWidget = {
            ".suggest-widget": {
                height: "auto !important",
                boxShadow: theme.suggestion.shadow,
                borderColor: `${theme.suggestion.colors.line} !important`,

                ".monaco-list .monaco-list-row": {
                    fontFamily: theme.suggestion.font,
                    background: theme.suggestion.colors.background,
                    color: theme.globals.colors.font,
                    fontSize: `${theme.suggestion.item.fontSize}px !important`,

                    ".label-name": {
                        "&:hover, &:focus, &:active": {
                            textDecoration: "none",
                        },
                    },

                    "&.focused, &.selected, &.focused:hover, &.selected:hover": {
                        background: theme.suggestion.colors.selectedBackground,
                        color: theme.globals.colors.font,
                    },

                    "&:hover:not(.selected):not(.focused)": {
                        background: `${theme.suggestion.colors.selectedBackground} !important`,
                        color: theme.globals.colors.font,
                    },

                    ".monaco-highlighted-label .highlight, &.focused .monaco-highlighted-label .highlight": {
                        background: theme.suggestion.colors.highlightedBackground,
                        color: theme.globals.colors.font,
                    },

                    "&.focused .readMore": {
                        display: "inline-block !important",
                        visibility: "visible !important",

                        "&[aria-hidden='true']": {
                            display: "none !important",
                        },

                        "&:before": {
                            padding: "3px 0",
                            display: "block",
                            backgroundPosition: "center",
                            ...createIconDefinition(icons?.detail),
                        },
                    },

                    "&.focused:hover .details-label, &.focused .details-label": {
                        width: "calc(100% - 32px) !important",
                    },

                    "& > .contents": {
                        paddingLeft: "10px",
                    },

                    ".details-label": {
                        fontSize: `${theme.suggestion.label.fontSize}px`,
                        fontFamily: theme.globals.font,
                        color: theme.suggestion.colors.active,
                    },

                    ".suggest-icon": {
                        marginRight: "5px",

                        "&.codicon-symbol-field:before": {
                            ...customIcon,
                            ...createIconDefinition(icons?.fact),
                        },
                        "&.codicon-symbol-variable:before": {
                            ...customIcon,
                            ...createIconDefinition(icons?.metric),
                        },
                        "&.codicon-symbol-constant:before": {
                            ...customIcon,
                            ...createIconDefinition(icons?.dataset),
                        },
                        "&.codicon-symbol-text:before": {
                            ...customIcon,
                            ...createIconDefinition(icons?.label),
                        },
                        "&.codicon-symbol-enum:before": {
                            ...customIcon,
                            ...createIconDefinition(icons?.attribute),
                        },
                        "&.codicon-symbol-keyword:before": {
                            ...customIcon,
                            ...createIconDefinition(icons?.keyword),
                        },
                        "&.codicon-symbol-function:before": {
                            ...customIcon,
                            ...createIconDefinition(icons?.function),
                        },
                    },
                },
            },
        };

        const suggestionsDetails = {
            ".suggest-details": {
                fontFamily: theme.globals.font,
                minHeight: `${2 * theme.detail.padding + theme.detail.header.size}px`,
                borderColor: `${theme.detail.colors.border} !important`,
                boxShadow: `0 1px 20px ${theme.globals.colors.shadow}`,

                ".monaco-scrollable-element .body": {
                    color: theme.globals.colors.font,
                    background: theme.detail.colors.background,
                    padding: `${theme.detail.padding}px`,

                    ".header": {
                        fontSize: `${theme.detail.header.fontSize}px`,
                        lineHeight: `${theme.detail.header.lineHeight}px`,
                        color: theme.detail.colors.header,

                        ".codicon-close": {
                            width: "auto !important",
                            height: "auto !important",
                            fontFamily: theme.detail.header.close.font,
                            fontSize: `${theme.detail.header.close.size}px`,
                            top: `${theme.detail.padding}px`,
                            right: `${theme.detail.padding}px`,

                            "&::before": {
                                content: '"\\e62d"',
                            },
                        },

                        p: {
                            margin: `0 ${theme.detail.padding * 2}px 0 0`,
                            padding: 0,
                        },
                    },
                },
            },
        };

        const decorators = Object.keys(Decorators).reduce(
            (prev, name) => {
                const item = Decorators[name];
                prev[`.${item.decorator.join(".")}`] = {
                    background: themeData?.colors[`editor.variable.${name}.background`] ?? "#cecece",
                    color: themeData?.colors[`editor.variable.${name}.color`] ?? "#7e7e7e",
                    ...(theme.decorator as { [key: string]: CSSInterpolation }),
                };
                prev[`.${item.decoratorItem.join(".")}`] = {
                    color: themeData?.colors[`editor.variable.${name}.color`] ?? "#000000",
                };
                return prev;
            },
            {} as { [key: string]: CSSInterpolation },
        );

        const errorsView = {
            ".zone-widget-container.peekview-widget": {
                borderTopWidth: `${theme.errorsBar.border.topWidth}px !important`,
                borderTopColor: `${theme.errorsBar.colors.error} !important`,
                borderBottomColor: `${theme.errorsBar.colors.error} !important`,
                left: theme.errorsBar.left,
                width: `calc(100% - ${theme.errorsBar.left}px)`,
                background: `${theme.errorsBar.colors.bodyBackground} !important`,

                ".head": {
                    background: `${theme.errorsBar.colors.headBackground} !important`,

                    ".peekview-title": {
                        marginLeft: `${theme.errorsBar.paddingHorizontal}px !important`,
                    },

                    ".filename": {
                        display: "none",
                    },
                    ".dirname": {
                        fontSize: `${theme.errorsBar.sizes.headerFontSize}px !important`,
                        lineHeight: `${theme.errorsBar.sizes.lineHeight}px  !important`,
                        fontFamily: theme.errorsBar.font,
                        color: `${theme.errorsBar.colors.font} !important`,
                    },
                },
                ".body": {
                    borderColor: `${theme.errorsBar.colors.error} !important`,
                    background: `${theme.errorsBar.colors.bodyBackground} !important`,

                    ".monaco-scrollable-element": {
                        border: "none !important",
                        width: "auto !important",

                        ".descriptioncontainer": {
                            paddingLeft: `${theme.errorsBar.paddingHorizontal}px !important`,
                            paddingRight: `${theme.errorsBar.paddingHorizontal}px !important`,
                            paddingTop: `${theme.errorsBar.paddingVertical}px !important`,
                        },
                    },

                    ".message": {
                        fontFamily: `${theme.errorsBar.font} !important`,
                        fontSize: `${theme.errorsBar.sizes.bodyFontSize}px !important`,
                        color: `${theme.errorsBar.colors.body} !important`,

                        "& > div::first-letter": {
                            textTransform: "uppercase",
                        },
                    },
                },

                ".codicon-marker-navigation-next:before": {
                    ...customIcon,
                    ...createIconDefinition(icons?.next),
                },
                ".codicon-marker-navigation-previous:before": {
                    ...customIcon,
                    ...createIconDefinition(icons?.prev),
                },
                ".codicon-close:before": {
                    ...customIcon,
                    ...createIconDefinition(icons?.close),
                },
            },
        };

        const hoverView = {
            ".monaco-hover": {
                border: theme.hoverBar.border,
                borderRadius: theme.hoverBar.sizes.borderRadius,
                background: theme.hoverBar.colors.background,
                boxShadow: theme.hoverBar.boxShadow,
                fontFamily: theme.hoverBar.font,

                ".monaco-scrollable-element": {
                    border: "none !important",
                },

                ".monaco-hover-content": {
                    ".hover-row": {
                        borderTop: "none !important",

                        ".marker.hover-contents": {
                            fontFamily: `${theme.hoverBar.font} !important`,
                            margin: theme.hoverBar.margin,
                            padding: theme.hoverBar.padding,
                            borderRadius: theme.hoverBar.sizes.borderRadiusInner,
                            background: theme.hoverBar.colors.errorBackground,
                            color: theme.hoverBar.colors.errorText,
                            fontSize: `${theme.hoverBar.sizes.font}px !important`,

                            "&::first-letter": {
                                textTransform: "uppercase",
                            },
                        },
                    },

                    ".hover-row.status-bar": {
                        display: "none",
                    },
                },
            },
        };

        const hoverDecorator = {
            [`.${DecoratorHovered}`]: {
                background: `${theme.hoverMetric.colors.hover} !important`,
                ...(theme.decorator as { [key: string]: CSSInterpolation }),
            },
        };

        return {
            [`#${id} .monaco-editor.vs`]: {
                ...editor,
                ...suggestionWidget,
                ...suggestionsDetails,
                ...decorators,
                ...hoverDecorator,
                ...errorsView,
                ...hoverView,
            } as CSSInterpolation,
        };
    }, [
        id,
        icons?.attribute,
        icons?.detail,
        icons?.fact,
        icons?.function,
        icons?.keyword,
        icons?.label,
        icons?.metric,
        icons?.dataset,
        icons?.next,
        icons?.prev,
        icons?.close,
        theme.content.colors.activeLineNumber,
        theme.content.colors.lineNumber,
        theme.content.colors.slider,
        theme.content.colors.sliderHover,
        theme.content.colors.bracketMatch,
        theme.detail.colors.background,
        theme.detail.colors.border,
        theme.detail.colors.header,
        theme.detail.header.close.font,
        theme.detail.header.close.size,
        theme.detail.header.fontSize,
        theme.detail.header.lineHeight,
        theme.detail.header.size,
        theme.detail.padding,
        theme.globals.colors.font,
        theme.globals.colors.shadow,
        theme.globals.font,
        theme.suggestion.colors.active,
        theme.suggestion.colors.background,
        theme.suggestion.colors.highlightedBackground,
        theme.suggestion.colors.line,
        theme.suggestion.colors.selectedBackground,
        theme.suggestion.font,
        theme.suggestion.item.fontSize,
        theme.suggestion.label.fontSize,
        theme.suggestion.shadow,
        theme.errorsBar.colors.error,
        theme.errorsBar.colors.headBackground,
        theme.errorsBar.colors.bodyBackground,
        theme.errorsBar.colors.font,
        theme.errorsBar.colors.body,
        theme.errorsBar.border.topWidth,
        theme.errorsBar.sizes.lineHeight,
        theme.errorsBar.sizes.headerFontSize,
        theme.errorsBar.sizes.bodyFontSize,
        theme.errorsBar.left,
        theme.errorsBar.font,
        theme.errorsBar.paddingHorizontal,
        theme.errorsBar.paddingVertical,
        theme.hoverBar.border,
        theme.hoverBar.sizes.borderRadius,
        theme.hoverBar.colors.background,
        theme.hoverBar.boxShadow,
        theme.hoverBar.font,
        theme.hoverBar.margin,
        theme.hoverBar.padding,
        theme.hoverBar.sizes.borderRadiusInner,
        theme.hoverBar.sizes.font,
        theme.hoverBar.colors.errorBackground,
        theme.hoverBar.colors.errorText,
        theme.hoverMetric.colors.hover,
        theme.decorator,
        themeData?.colors,
    ]);
}

function createIconDefinition(icon?: IMaqlEditorIcon | null) {
    const def: { [key: string]: CSSInterpolation } = {};

    if (icon) {
        def["content"] = '""';
        def["backgroundImage"] = `url("data:image/svg+xml;base64,${icon.base64}")`;
        def["backgroundRepeat"] = "no-repeat";

        if (icon.width) {
            def["width"] = `${icon.width}px`;
        }
        if (icon.height) {
            def["height"] = `${icon.height}px`;
        }
    }
    return def;
}
