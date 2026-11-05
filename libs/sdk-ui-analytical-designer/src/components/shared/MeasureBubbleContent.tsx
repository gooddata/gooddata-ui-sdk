// (C) 2007-2026 GoodData Corporation

import { useCallback } from "react";

import { FormattedMessage } from "react-intl";
import { useDispatch } from "react-redux";

import { type ObjRef, type ObjectType } from "@gooddata/sdk-model";

import { metricEditorOpen } from "../../store/metric_editor/metric_editor_actions.js";
import { type AppDispatch } from "../../store/types.js";
import { type IExpressionToken, type IOrganizedCatalogTooltipDetailsMeasure } from "../../typings/catalog.js";

function TooltipMetricMaql({ metricMaql }: IOrganizedCatalogTooltipDetailsMeasure) {
    if (metricMaql) {
        return (
            <>
                {metricMaql.map((metric, idx) => {
                    return metric.category === "text" ? metric.title : <MaqlSegment key={idx} {...metric} />;
                })}
            </>
        );
    }

    return <FormattedMessage id="loading" />;
}

const isMeasureSegment = (category: string) => ["measure", "metric"].includes(category);

function MaqlSegment({ title, id, category }: IExpressionToken) {
    const dispatch = useDispatch<AppDispatch>();

    const openMetricEditorDialog = useCallback(
        (metricRef: ObjRef) => {
            dispatch(metricEditorOpen(metricRef));
        },
        [dispatch],
    );

    const openMetricEditorDialogHandler = useCallback(() => {
        openMetricEditorDialog({
            type: category as ObjectType,
            identifier: id,
        });
    }, [id, category, openMetricEditorDialog]);

    if (isMeasureSegment(category) && id) {
        return (
            <a
                className="s-adi-maql-segment-link-clickable"
                rel="noopener noreferrer"
                onClick={openMetricEditorDialogHandler}
            >
                <MaqlSegmentTitle
                    title={title}
                    category={category}
                    classNames="adi-maql-segment-link adi-maql-segment-clickable s-adi-maql-segment-clickable"
                />
            </a>
        );
    }

    return <MaqlSegmentTitle title={title} category={category} />;
}

interface IMaqlSegmentTitleProps {
    title: string;
    category: string;
    classNames?: string;
}

function MaqlSegmentTitle({ category, title, classNames }: IMaqlSegmentTitleProps) {
    return <span className={`${category} adi-maql-segment s-adi-maql-segment ${classNames}`}>{title}</span>;
}

export function MeasureBubbleContent({ metricMaql }: IOrganizedCatalogTooltipDetailsMeasure) {
    return (
        <span>
            <h4 className="s-adi-catalog-tooltip-detail-heading">
                <FormattedMessage id="dashboard.catalog_item.defined_as" />
            </h4>
            <p className="adi-metric-maql s-adi-catalog-tooltip-measure-expression">
                <TooltipMetricMaql metricMaql={metricMaql} />
            </p>
        </span>
    );
}
