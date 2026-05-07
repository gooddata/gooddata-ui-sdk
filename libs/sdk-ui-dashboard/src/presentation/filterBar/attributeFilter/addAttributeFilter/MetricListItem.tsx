// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import cx from "classnames";

import { type ICatalogMeasure } from "@gooddata/sdk-model";
import { ShortenedText } from "@gooddata/sdk-ui-kit";
import { simplifyText } from "@gooddata/util";

interface IMetricListItemProps {
    item: ICatalogMeasure;
    title?: string;
    onClick?: () => void;
}

const TOOLTIP_ALIGN_POINT = [
    { align: "cr cl", offset: { x: 10, y: 0 } },
    { align: "cl cr", offset: { x: -10, y: 0 } },
];

export function MetricListItem({ item, title, onClick }: IMetricListItemProps) {
    const classNames = useMemo(() => {
        return cx(`s-${simplifyText(item.measure.title)}`, "gd-attribute-list-item", {
            "gd-list-item": true,
            "gd-list-item-shortened": true,
            "type-metric": true,
            "is-disabled": !onClick,
        });
    }, [item, onClick]);

    return (
        <div className={classNames} onClick={onClick}>
            <ShortenedText tooltipAlignPoints={TOOLTIP_ALIGN_POINT}>
                {getMetricListItemTitle(item, title)}
            </ShortenedText>
        </div>
    );
}

export const getMetricListItemTitle = (item: ICatalogMeasure, title?: string) => {
    return title ?? item.measure.title;
};
