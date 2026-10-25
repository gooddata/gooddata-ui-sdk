// (C) 2021-2026 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { type IMeasureMetadataObject, type ISeparators } from "@gooddata/sdk-model";
import { RichText, ScrollGradient } from "@gooddata/sdk-ui-kit";

import { type IMaqlFragmentCommonProps, MaqlPreview } from "../MaqlPreview/MaqlPreview.js";
import { makeStyles } from "../theme/index.js";

const useStyles = makeStyles()((theme) => ({
    description: {
        fontSize: 12,
        color: theme.globals.colors.defaultStateBlank,
        marginBottom: 16,
    },
    defined: {
        fontSize: 10,
        lineHeight: "10px",
        color: theme.globals.colors.defaultStateBlank,
        marginBottom: 4,
        textTransform: "uppercase",
    },
    tooltip: {
        maxHeight: "60vh",
        minWidth: "100px",
        display: "flex",
        flexDirection: "column",
    },
    scrollableContent: {
        padding: "0 16px 8px 16px",
    },
    header: {
        fontSize: 14,
        color: "#474e56",
        padding: "16px 16px 8px 16px",
    },
}));

/**
 * @internal
 */
export interface IMetricTooltipContentProps {
    metric: IMeasureMetadataObject;
    previewOptions?: IMaqlFragmentCommonProps;
    showEditButton?: boolean;
    onEditClick?: () => void;
    useReferences?: boolean;
    separators?: ISeparators;
}

export function MetricTooltipContent({
    metric,
    previewOptions = {},
    separators,
    useReferences = false,
}: IMetricTooltipContentProps) {
    const { classes } = useStyles();

    return (
        <div className={classes.tooltip}>
            <div className={classes.header}>{metric.title}</div>
            <ScrollGradient contentClassName={classes.scrollableContent}>
                <div className={classes.description}>
                    <RichText
                        value={metric.description}
                        renderMode="view"
                        referencesEnabled={useReferences}
                        separators={separators}
                    />
                </div>
                <div className={classes.defined}>
                    <FormattedMessage id="metricList.metricListItemTooltip.defined" />
                </div>
                <MaqlPreview
                    metricRef={metric.ref}
                    expressionFallback={metric.expression}
                    maqlFragmentCommonProps={previewOptions}
                />
            </ScrollGradient>
        </div>
    );
}
