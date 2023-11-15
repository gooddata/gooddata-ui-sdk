// (C) 2019-2022 GoodData Corporation
import React from "react";
import { Button } from "@gooddata/sdk-ui-kit";

import { selectEnableRenamingMeasureToMetric, useDashboardSelector } from "../../../../model/index.js";

export interface IDrillOriginItemProps {
    title: string;
    type: string;
    onDelete: () => void;
    isDateAttribute: boolean;
}

const getIconType = (type: string, isDateAttribute: boolean, shouldRenameMeasureToMetric: boolean) => {
    if (isDateAttribute) {
        return "date";
    }

    if (shouldRenameMeasureToMetric && type === "measure") {
        return "metric";
    }

    return type;
};

export const DrillOriginItem: React.FunctionComponent<IDrillOriginItemProps> = ({
    onDelete,
    title,
    type,
    isDateAttribute,
}) => {
    const shouldRenameMeasureToMetric = useDashboardSelector(selectEnableRenamingMeasureToMetric);

    const iconType = getIconType(type, isDateAttribute, shouldRenameMeasureToMetric);
    const iconClassName = `dm-button-icon dm-button-icon-${iconType}`;

    return (
        <div className="gd-drill-config-measure-item">
            <div className={iconClassName} />
            <div className="dm-button-title s-drill-config-item-title" title={title}>
                {title}
            </div>
            <div className="dm-button-delete-wrapper">
                <Button
                    className="drill-config-item-delete gd-button-link gd-button-icon-only gd-icon-cross s-drill-config-item-delete"
                    onClick={onDelete}
                />
            </div>
        </div>
    );
};
