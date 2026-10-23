// (C) 2020-2026 GoodData Corporation

import { LoadingSpinner } from "@gooddata/sdk-ui-kit";

import { makeStyles } from "../theme/index.js";

const useStyles = makeStyles()(() => ({
    root: {
        position: "fixed",
        top: "50%",
        left: "50%",
    },
}));

export function GlobalLoading() {
    const { classes, cx } = useStyles();
    return <LoadingSpinner className={cx(classes.root, "large")} />;
}
