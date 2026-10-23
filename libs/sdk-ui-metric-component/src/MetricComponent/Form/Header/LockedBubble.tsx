// (C) 2021-2026 GoodData Corporation

import { type ReactElement } from "react";

import { FormattedMessage } from "react-intl";

import { Bubble, BubbleHoverTrigger, IconLock } from "@gooddata/sdk-ui-kit";

import { makeStyles } from "../../../shared/theme/index.js";

const useStyles = makeStyles()(() => ({
    root: {
        paddingTop: 5,
        paddingRight: 5,
    },
}));

export function LockedBubble(): ReactElement {
    const { classes } = useStyles();

    return (
        <BubbleHoverTrigger className={classes.root} showDelay={0} hideDelay={0}>
            <IconLock className="s-lockedIcon" />
            <Bubble className="bubble-primary" alignPoints={[{ align: "bc tl" }]}>
                <FormattedMessage id="metricComponent.editMetric.protectedMetric" />
            </Bubble>
        </BubbleHoverTrigger>
    );
}
