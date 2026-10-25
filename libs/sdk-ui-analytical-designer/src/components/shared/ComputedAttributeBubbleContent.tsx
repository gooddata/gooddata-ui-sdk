// (C) 2026 GoodData Corporation

import {
    type IOrganizedCatalogTooltipDetailsAttribute,
    type IOrganizedCatalogTooltipDetailsMeasure,
} from "../../typings/catalog.js";

import { TooltipValuesSection } from "./AttributeBubbleContent.js";
import { MeasureBubbleContent } from "./MeasureBubbleContent.js";

export type IComputedAttributeBubbleContentProps = IOrganizedCatalogTooltipDetailsAttribute &
    IOrganizedCatalogTooltipDetailsMeasure;

/**
 * A computed attribute is an attribute with values AND a MAQL definition, so its tooltip shows
 * both: the values first (like an attribute), the definition after (like a metric).
 */
export function ComputedAttributeBubbleContent(props: IComputedAttributeBubbleContentProps) {
    const { metricMaql, projectId, isRedirectAllowed } = props;

    return (
        <span>
            <TooltipValuesSection {...props} />
            <MeasureBubbleContent
                metricMaql={metricMaql}
                projectId={projectId}
                isRedirectAllowed={isRedirectAllowed}
            />
        </span>
    );
}
