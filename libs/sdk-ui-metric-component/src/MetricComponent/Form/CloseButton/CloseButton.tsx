// (C) 2021-2026 GoodData Corporation

import { type ReactElement } from "react";

import { Button } from "@gooddata/sdk-ui-kit";

import { makeStyles } from "../../../shared/theme/index.js";

const useStyles = makeStyles()(() => ({
    root: {
        position: "absolute",
        top: "14px",
        right: "14px",
    },
}));

export interface ICloseButtonProps {
    onClick?: () => void;
}

export function CloseButton({ onClick }: ICloseButtonProps): ReactElement {
    const { classes, cx } = useStyles();

    return (
        <div className={cx(classes.root, "gd-dialog-close")}>
            <Button
                className="gd-button-link gd-button-icon-only gd-icon-cross s-dialog-close-button"
                value=""
                onClick={onClick}
            />
        </div>
    );
}
