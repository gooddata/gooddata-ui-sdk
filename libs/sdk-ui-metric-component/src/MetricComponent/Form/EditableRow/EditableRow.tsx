// (C) 2021-2026 GoodData Corporation

import { memo, useCallback, useLayoutEffect, useRef, useState } from "react";

import cx from "classnames";

import { type ISeparators } from "@gooddata/sdk-model";
// we need this version of classnames, tss version work differently
import { type IAlignPoint, RichTextWithTooltip } from "@gooddata/sdk-ui-kit";

import { makeStyles } from "../../../shared/theme/index.js";

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            display: "flex",
            width: "100%",
        },
        richText: {
            [".gd-bubble-trigger"]: {
                width: "100%",
            },
            minHeight: "29px",
            maxHeight: "250px",
            border: "1px solid transparent",
            padding: "4px 4px",
            color: theme.globals.colors.subtitle,
            lineHeight: "19px",
            cursor: "pointer",
            "&:hover": {
                border: `1px solid ${theme.tabs.colors.border}`,
            },
            textarea: {
                lineHeight: "19px",
                padding: 0,
                fontFamily: theme.fonts.main,
                color: theme.globals.colors.subtitle,
                "&::placeholder": {
                    color: theme.tabs.colors.placeholder,
                },
            },
            "&.active": {
                border: `1px solid ${theme.tabs.colors.border}`,
            },
        },
        richTextFit: {
            textarea: { verticalAlign: "top" },
        },
        richTextView: {
            lineHeight: "19px",
            color: theme.globals.colors.subtitle,
            overflow: "auto",
            "p, ul": { color: theme.globals.colors.description, marginBottom: 0 },
            a: { marginBottom: 0 },
        },
        richTextViewEmpty: {
            lineHeight: "19px",
            color: theme.tabs.colors.placeholder,
        },
    };
});

const richTextTooltipAlignPoints: IAlignPoint[] = [
    { align: "bl tl", offset: { x: 6, y: 4 } },
    { align: "tl bl", offset: { x: 6, y: -4 } },
];

export interface IEditableRowProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    readOnly?: boolean;
    onHeightChange?: (height: number) => void;
    autoResize?: boolean;
    useReferences?: boolean;
    separators?: ISeparators;
}

function EditableRowComponent({
    value = "",
    onChange,
    placeholder = "",
    className,
    autoResize,
    onHeightChange,
    useReferences = false,
    separators,
}: IEditableRowProps) {
    const { classes } = useStyles();

    const [richTextEditMode, setRichTextEditMode] = useState(false);

    const handleRichTextClick = useCallback(() => {
        setRichTextEditMode(true);
    }, []);

    const handleRichTextBlur = useCallback(() => {
        setRichTextEditMode(false);
    }, []);

    const element = useRef<HTMLDivElement | null>(null);
    useLayoutEffect(() => {
        if (onHeightChange && element?.current) {
            onHeightChange(element.current.clientHeight);
        }
    });

    return (
        <div className={cx(classes.root, className)} ref={element}>
            <div
                className={cx(classes.richText, {
                    active: richTextEditMode,
                    [classes.richTextView]: !richTextEditMode && value,
                    [classes.richTextFit]: autoResize,
                })}
                onClick={handleRichTextClick}
                onBlur={handleRichTextBlur}
            >
                <RichTextWithTooltip
                    value={value}
                    renderMode={richTextEditMode ? "edit" : "view"}
                    editRows={5}
                    autoResize={autoResize}
                    showTooltip={richTextEditMode}
                    editPlaceholder={placeholder}
                    emptyElement={<div className={classes.richTextViewEmpty}>{placeholder}</div>}
                    tooltipAlignPoints={richTextTooltipAlignPoints}
                    onChange={onChange}
                    separators={separators}
                    referencesEnabled={useReferences}
                />
            </div>
        </div>
    );
}

export const EditableRow = memo(EditableRowComponent);
