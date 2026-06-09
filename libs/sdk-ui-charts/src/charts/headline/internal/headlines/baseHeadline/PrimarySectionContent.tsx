// (C) 2023-2026 GoodData Corporation

import { type CSSProperties } from "react";

import {
    type BaseHeadlineDataItemComponentType,
    type IBaseHeadlineItem,
} from "../../interfaces/BaseHeadlines.js";

interface IPrimarySectionProps {
    primaryItem: IBaseHeadlineItem;
    customStyle?: CSSProperties;
}

export function PrimarySectionContent({ primaryItem, customStyle }: IPrimarySectionProps) {
    /**
     * When JSX combines all `dataItem.baseHeadlineDataItemComponent` union types, it creates a final
     * intersection type of these component's props to ensure proper type safety, when used in such general way.
     * However, the JSX is not smart enough to realize that `dataItem.baseHeadlineDataItemComponent` and
     * `dataItem.data` are correlated so it is actually fine here and there shouldn't be any type errors in reality.
     * The casting below prevents creation of the default component's props-intersection type so that no type issue arises.
     */
    const BaseHeadlineDataItem =
        primaryItem.baseHeadlineDataItemComponent as BaseHeadlineDataItemComponentType;

    return (
        <div className="gd-flex-item headline-primary-item s-headline-primary-item" style={customStyle}>
            <BaseHeadlineDataItem
                dataItem={primaryItem.data}
                evaluationType={primaryItem.evaluationType}
                elementType={primaryItem.elementType}
                shouldHideTitle
                includeHeightCheck
            />
        </div>
    );
}
