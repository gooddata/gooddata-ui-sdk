// (C) 2023-2025 GoodData Corporation

import { useIntl } from "react-intl";

import { ResponsiveText } from "@gooddata/sdk-ui-kit";

import { ComparisonValue } from "./ComparisonValue.js";
import { useComparisonDataItem } from "./useComparisonDataItem.js";
import {
    IBaseHeadlineDataItemProps,
    IComparisonDataWithSubItem,
} from "../../../../interfaces/BaseHeadlines.js";
import { useOutOfBoundsDetection } from "../useOutOfBoundsDetection.js";
import { withTitle } from "../withTitle.js";

function ComparisonDataWithSubItemComponent({
    dataItem,
    evaluationType,
    onValueOverflow,
    measurementTrigger,
}: IBaseHeadlineDataItemProps<IComparisonDataWithSubItem>) {
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
            <span className="sr-only">{comparisonAriaLabelFactory?.(intl)}</span>
        </div>
    );
}

export const ComparisonDataWithSubItem = withTitle(ComparisonDataWithSubItemComponent);
