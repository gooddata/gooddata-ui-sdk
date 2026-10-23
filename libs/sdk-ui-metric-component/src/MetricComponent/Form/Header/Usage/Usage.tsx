// (C) 2021-2026 GoodData Corporation

import { useState } from "react";

import { FormattedMessage, type IntlShape, useIntl } from "react-intl";

import { type IMeasureReferencing } from "@gooddata/sdk-backend-spi";
import { type IInsight, type IMetadataObject } from "@gooddata/sdk-model";
import { Button } from "@gooddata/sdk-ui-kit";

import { makeStyles } from "../../../../shared/theme/index.js";
import { useToggleWithCollapse } from "../../hooks/useToggleWithCollapse.js";

import { UsagesOverlay } from "./UsagesOverlay.js";

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            marginTop: 2,
            whiteSpace: "nowrap",
        },
        usedIn: {
            marginLeft: 2,
            color: theme.globals.colors.defaultStateBlank,
        },
        link: {
            marginBottom: 2,
            textDecoration: "underline",
            color: theme.globals.colors.link,

            "&:focus": {
                color: theme.globals.colors.link,
            },
        },
    };
});

export interface IUsageProps {
    data: IMeasureReferencing;
    onOpenUsage?: () => void;
    activeInsight?: IInsight;
    insightOpenType?: "external" | "internal";
    onInsightClick?: (object: IInsight) => void;
    metricOpenType?: "external" | "internal";
    onMetricClick?: (object: IMetadataObject) => void;
}

export function Usage({
    data,
    onOpenUsage,
    insightOpenType,
    metricOpenType,
    activeInsight,
    onInsightClick,
    onMetricClick,
}: IUsageProps) {
    const { insights = [], measures = [] } = data;
    const { classes, cx } = useStyles();

    const [metricsOpened, toggleMetrics] = useToggleWithCollapse(measures.length);
    const [insightsOpened, toggleInsights] = useToggleWithCollapse(insights.length);

    const [isOpenedUsages, setOpen] = useState(false);
    const intl = useIntl();

    const toggleOpenUsagesOverlay = () => {
        setOpen(!isOpenedUsages);
        if (onOpenUsage) {
            onOpenUsage();
        }
    };
    const toggleSectionUsages = (type: "metrics" | "insights") => {
        switch (type) {
            case "insights":
                toggleInsights();
                break;
            case "metrics":
                toggleMetrics();
                break;
            default:
                break;
        }
    };

    if (measures.length == 0 && insights.length == 0) {
        return null;
    }

    return (
        <div className={cx(classes.root, "s-objectUsage")}>
            <span className={classes.usedIn}>
                <FormattedMessage id="metricComponent.objectUsage.usedIn" />
            </span>
            <Button
                className={cx(classes.link, "gd-button-link")}
                tagName="a"
                value={createTitle(intl, measures.length, insights.length)}
                onClick={toggleOpenUsagesOverlay}
            />
            {isOpenedUsages && (
                <UsagesOverlay
                    data={data}
                    insightsOpened={insightsOpened}
                    metricsOpened={metricsOpened}
                    onToggle={toggleSectionUsages}
                    onClose={toggleOpenUsagesOverlay}
                    activeInsight={activeInsight}
                    insightOpenType={insightOpenType}
                    onInsightClick={onInsightClick}
                    metricOpenType={metricOpenType}
                    onMetricClick={onMetricClick}
                />
            )}
        </div>
    );
}

function createTitle(intl: IntlShape, metricsCount: number, insightsCount: number): string {
    const titleParts: string[] = [];

    if (metricsCount > 0) {
        titleParts.push(
            intl.formatMessage({ id: "metricComponent.objectUsage.metricsCount" }, { count: metricsCount }),
        );
    }
    if (insightsCount > 0) {
        titleParts.push(
            intl.formatMessage({ id: "metricComponent.objectUsage.insightsCount" }, { count: insightsCount }),
        );
    }
    return titleParts.join(", ");
}
