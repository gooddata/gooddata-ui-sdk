// (C) 2023-2025 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";
import { ResponsiveText } from "@gooddata/sdk-ui-kit";

import {
    IBaseHeadlineDataItemProps,
    IComparisonDataWithSubItem,
} from "../../../../interfaces/BaseHeadlines.js";
import { withTitle } from "../withTitle.js";
import { useComparisonDataItem } from "./useComparisonDataItem.js";
import { ComparisonValue } from "./ComparisonValue.js";
import { useOutOfBoundsDetection } from "../useOutOfBoundsDetection.js";

const ComparisonDataWithSubItemComponent: React.FC<
    IBaseHeadlineDataItemProps<IComparisonDataWithSubItem>
> = ({ dataItem, evaluationType, onValueOverflow, measurementTrigger }) => {
    const intl = useIntl();
    const {
        style,
        indicator: ComparisonIndicator,
        comparisonAriaLabelFactory,
    } = useComparisonDataItem(evaluationType, dataItem);
    const { containerRef } = useOutOfBoundsDetection(onValueOverflow, measurementTrigger);
    return (
        <div ref={containerRef} style={style} className="headline-value-wrapper s-headline-value-wrapper">
            <ResponsiveText minFontSize={10}>
                <div
                    className="comparison-headline-value-wrapper s-comparison-headline-value-wrapper"
                    aria-hidden={true}
                >
                    {ComparisonIndicator ? <ComparisonIndicator /> : null}
                    <ComparisonValue dataItem={dataItem.item} comparisonStyle={style} />
                    <ComparisonValue dataItem={dataItem.subItem} comparisonStyle={style} isSubItem={true} />
                </div>
            </ResponsiveText>
            <span className="sr-only" id="sr-metric" role="status" aria-live="polite" aria-atomic="true">
                {comparisonAriaLabelFactory?.(intl)}
            </span>
        </div>
    );
};

export const ComparisonDataWithSubItem = withTitle(ComparisonDataWithSubItemComponent);
