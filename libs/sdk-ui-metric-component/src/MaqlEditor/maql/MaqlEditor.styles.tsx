// (C) 2021-2026 GoodData Corporation

import { useMemo } from "react";

import { type CSSInterpolation, GlobalStyles } from "tss-react";

import { ExpandedClass } from "../components/ExpandableTooltip.js";
import { makeStyles } from "../theme/styles.js";

const useStyles = makeStyles()(() => ({}));

export function MaqlStyles() {
    const styles = useMaqlStyles();

    return <GlobalStyles styles={styles} />;
}

function useMaqlStyles() {
    const { theme } = useStyles();
    return useMemo<CSSInterpolation>(() => {
        const h1 = {
            fontFamily: theme.doc.font,
            fontSize: `${theme.doc.h1.fontSize}px`,
            lineHeight: `${theme.doc.h1.lineHeight}px`,
            fontWeight: "bold",
            color: theme.doc.colors.main,
            margin: `${theme.doc.bigPadding}px 0`,
        };
        const h2 = {
            fontFamily: theme.doc.font,
            fontSize: `${theme.doc.h2.fontSize}px`,
            lineHeight: `${theme.doc.h2.lineHeight}px`,
            fontWeight: "bold",
            color: theme.doc.colors.main,
            margin: `${theme.doc.smallPadding}px 0`,
        };
        const h3 = {
            fontFamily: theme.doc.font,
            fontSize: `${theme.doc.h3.fontSize}px`,
            lineHeight: `${theme.doc.h3.lineHeight}px`,
            fontWeight: "bold",
            color: theme.doc.h3.color,
            margin: `${theme.doc.bigPadding}px 0 ${theme.doc.smallPadding}px 0`,
            textTransform: "uppercase",
        };
        const h1p = {
            fontFamily: theme.doc.font,
            fontSize: `${theme.doc.h1p.fontSize}px`,
            lineHeight: `${theme.doc.h1p.lineHeight}px`,
            color: theme.doc.h1p.color,
            margin: `${theme.doc.bigPadding}px 0`,
        };
        const p = {
            fontFamily: theme.doc.font,
            fontSize: `${theme.doc.p.fontSize}px`,
            lineHeight: `${theme.doc.p.lineHeight}px`,
            color: theme.doc.p.color,
            margin: `${theme.doc.smallPadding}px 0`,
        };
        const code = {
            fontFamily: theme.doc.code.font,
            fontSize: `${theme.doc.code.fontSize}px`,
            lineHeight: `${theme.doc.code.lineHeight}px`,
            color: theme.doc.code.color,

            ".mkt1": {
                paddingBottom: "5px",
                color: theme.doc.code.color,
            },
        };
        const img = {
            maxWidth: "100%",
        };

        function h1pSelector(start: string) {
            const selectors: Array<string> = [];
            let parent = start;
            let i = 4;

            while (i >= 0) {
                selectors.push(`${parent} + :is(p, ul)`);
                parent = `${parent} + :is(p, ul)`;
                i--;
            }

            return selectors.join(", ");
        }

        return {
            ".monaco-editor.vs": {
                ".suggest-details .docs": {
                    fontFamily: theme.doc.font,

                    "& > div": {
                        padding: "0 !important",
                    },

                    h1: h1,
                    h2: h2,
                    h3: h3,
                    "p, ul": p,
                    ".code": code,
                    img: img,
                    [h1pSelector("h1")]: h1p,
                },
            } as CSSInterpolation,
        };
    }, [
        theme.doc.bigPadding,
        theme.doc.code.color,
        theme.doc.code.font,
        theme.doc.code.fontSize,
        theme.doc.code.lineHeight,
        theme.doc.colors.main,
        theme.doc.font,
        theme.doc.h1.fontSize,
        theme.doc.h1.lineHeight,
        theme.doc.h1p.color,
        theme.doc.h1p.fontSize,
        theme.doc.h1p.lineHeight,
        theme.doc.h2.fontSize,
        theme.doc.h2.lineHeight,
        theme.doc.h3.color,
        theme.doc.h3.fontSize,
        theme.doc.h3.lineHeight,
        theme.doc.p.color,
        theme.doc.p.fontSize,
        theme.doc.p.lineHeight,
        theme.doc.smallPadding,
    ]);
}

export const MaqlEditorClass = "maql-editor";
export const MaqlEditorTestClass = "s-maql_editor";
export const MaqlTooltip = "maql-metric-tooltip";
export const MaqlTooltipEditorClass = "maql-metric-tooltip-editor-content";
export const PencilIcon = "gd-icon-pencil";

export function TooltipMaqlStyles() {
    const styles = useTooltipMaqlStyles();

    return <GlobalStyles styles={styles} />;
}

function useTooltipMaqlStyles() {
    const { theme } = useStyles();
    return useMemo<CSSInterpolation>(() => {
        const { normal, expanded } = theme.hoverMetric.tooltip;

        return {
            [`.${MaqlTooltip}`]: {
                minWidth: normal.minWidth,
                maxWidth: normal.maxWidth,
                maxHeight: normal.maxHeight,
            },
            [`.${MaqlTooltip} .${PencilIcon}`]: {
                fontSize: 14,
            },
            [`.${MaqlTooltip} .${MaqlTooltipEditorClass}`]: {
                maxWidth: normal.maxWidth,
            },

            [`.${ExpandedClass} .${MaqlTooltip}`]: {
                minWidth: expanded.minWidth,
                maxWidth: expanded.maxWidth,
                maxHeight: expanded.maxHeight,
            },
            [`.${ExpandedClass} .${MaqlTooltip} .${MaqlTooltipEditorClass}`]: {
                maxWidth: expanded.maxWidth,
            },
        };
    }, [theme.hoverMetric.tooltip]);
}
