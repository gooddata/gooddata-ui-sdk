// (C) 2007-2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import { IMeasureMetadataObject } from "@gooddata/sdk-model";
import { IAlignPoint, ShortenedText } from "@gooddata/sdk-ui-kit";
import { stringUtils } from "@gooddata/util";

const tooltipAlignPoints: IAlignPoint[] = [{ align: "cl cr", offset: { x: -10, y: 0 } }];

interface IMetricDropdownItemProps {
    item?: IMeasureMetadataObject;
    isSelected?: boolean;
    unlistedTitle: string;
    unlistedIconTitle: string;
    isMobile?: boolean;
    onClick?: () => void;
}

export const MetricDropdownItem: React.FC<IMetricDropdownItemProps> = ({
    item,
    isSelected,
    unlistedTitle,
    unlistedIconTitle,
    isMobile,
    onClick,
}) => {
    if (!item) {
        return null;
    }

    const unlistedIcon = item?.unlisted ? (
        <span title={unlistedIconTitle} className="gd-icon-16 gd-icon-unlisted" />
    ) : (
        false
    );

    const effectiveTitle = item?.unlisted ? unlistedTitle : item.title;

    const metricItemClassNames = cx(`s-${stringUtils.simplifyText(effectiveTitle)}`, {
        "gd-list-item": true,
        "gd-list-item-shortened": true,
        "is-selected": isSelected,
    });

    const title = isMobile ? (
        effectiveTitle
    ) : (
        <ShortenedText tooltipAlignPoints={tooltipAlignPoints}>{effectiveTitle}</ShortenedText>
    );

    return (
        <div key={item.id} className={metricItemClassNames} onClick={onClick}>
            {title}
            {unlistedIcon}
        </div>
    );
};
