// (C) 2022-2026 GoodData Corporation

import { useState } from "react";

import { FormattedMessage } from "react-intl";

import { IconClose, IconExpand } from "@gooddata/sdk-ui-kit";

import { makeStyles } from "../../shared/theme/index.js";

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            display: "inline-flex",
            padding: `5px 2px 5px 12px`,
            fontFamily: theme.fonts.main,
            border: `1px solid ${theme.minimize.colors.border}`,
            boxShadow: theme.minimize.boxShadow,
            borderRadius: theme.minimize.sizes.borderRadius,
            background: theme.minimize.colors.background,

            "&.bottomRight": {
                position: "absolute",
                bottom: `10px`,
                right: `10px`,
            },
        },
        editing: {
            margin: 0,
            padding: 0,
            color: theme.minimize.colors.editing,
            fontSize: `${theme.minimize.fontSize.text}px`,
            lineHeight: `${theme.minimize.lineHeight.text}px`,
            cursor: "pointer",
            fontWeight: 700,
        },
        count: {
            margin: 0,
            padding: 0,
            color: theme.minimize.colors.count,
            fontSize: `${theme.minimize.fontSize.text}px`,
            lineHeight: `${theme.minimize.lineHeight.text}px`,
            minWidth: `${theme.minimize.sizes.countsMinWidth}px`,
        },
        info: {
            display: "inline-flex",
            gap: theme.minimize.sizes.gap,
            cursor: "pointer",
        },
        controls: {
            display: "inline-flex",
        },
        divider: {
            width: `1px`,
            margin: `3px 0`,
            background: theme.minimize.colors.divider,
        },
        button: {
            padding: 0,
            margin: 0,
            width: `${theme.minimize.sizes.button}px`,
            border: "none",
            background: "none",
            cursor: "pointer",
            display: "flex",
            alignContent: "center",
            justifyContent: "center",
            alignItems: "center",

            "svg path": {
                transition: "all 0.25s ease-in-out",
                fill: theme.tabs.colors.normal,
            },
            "&:hover svg path": {
                fill: theme.tabs.colors.hover,
            },
            "&.hover svg path": {
                fill: theme.tabs.colors.hover,
            },
        },
        indicator: {
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
            transition: "opacity 200ms, width 200ms",
            flexShrink: 0,
            width: theme.tabs.sizes.flag,
            marginRight: -2,

            "&:after": {
                content: `""`,
                display: "block",
                width: theme.tabs.sizes.flag,
                height: theme.tabs.sizes.flag,
                borderRadius: theme.tabs.sizes.flag,
            },
        },
        dirty: {
            "&:after": {
                background: theme.tabs.colors.dirty,
            },
        },
        invalid: {
            "&:after": {
                background: theme.tabs.colors.negative,
            },
        },
    };
});

export interface IMinimizedMetricComponentProps {
    editable?: boolean;
    visible?: boolean;
    edited?: number;
    where?: "bottomRight" | "inline";
    onClose?: () => void;
    onExpand?: () => void;
    dirty?: boolean;
    invalid?: boolean;
}

export function MinimizedMetricComponent({
    editable = true,
    visible = true,
    where = "inline",
    edited = 0,
    onExpand,
    onClose,
    dirty = false,
    invalid = false,
}: IMinimizedMetricComponentProps) {
    const { classes, cx } = useStyles();
    const [over, setOver] = useState(false);

    if (edited === 0 || !visible) {
        return null;
    }

    return (
        <div className={cx(classes.root, where, "s-edit_dialog-minimized")}>
            <div
                className={cx(classes.info)}
                onClick={onExpand}
                onMouseEnter={() => setOver(true)}
                onMouseLeave={() => setOver(false)}
            >
                <label className={cx(classes.editing)}>
                    {editable ? (
                        <FormattedMessage id="metricComponent.minimize.editing" />
                    ) : (
                        <FormattedMessage id="metricComponent.minimize.viewing" />
                    )}
                </label>
                {invalid && <div className={cx(classes.indicator, classes.invalid)} />}
                {dirty && !invalid && <div className={cx(classes.indicator, classes.dirty)} />}
                <div className={cx(classes.count, "s-edit_dialog-minimized-counter")}>
                    <FormattedMessage id="metricComponent.minimize.metrics" values={{ edited }} />
                </div>
            </div>
            <div className={cx(classes.controls)}>
                <button
                    className={cx(classes.button, over && "hover", "s-edit_dialog-minimized-expand")}
                    onClick={onExpand}
                >
                    <IconExpand />
                </button>
                <div className={cx(classes.divider)} />
                <button className={cx(classes.button, "s-edit_dialog-minimized-close")} onClick={onClose}>
                    <IconClose />
                </button>
            </div>
        </div>
    );
}
