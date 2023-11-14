// (C) 2019-2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import { Button } from "@gooddata/sdk-ui-kit";

import { selectEnableRenamingMeasureToMetric, useDashboardSelector } from "../../../../model/index.js";

export interface IDrillOriginItemProps {
    title: string;
    type: string;
    onDelete: () => void;
    isDateAttribute: boolean;
    // TODO:  should be removed when we enabled deleting drill down item
    readonly?: boolean;
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
    readonly,
}) => {
    const shouldRenameMeasureToMetric = useDashboardSelector(selectEnableRenamingMeasureToMetric);

    const iconType = getIconType(type, isDateAttribute, shouldRenameMeasureToMetric);
    const iconClassName = `dm-button-icon dm-button-icon-${iconType}`;
    const classNames = cx("gd-drill-config-measure-item", {
        "is-readonly": readonly,
    });

    return (
        <div className={classNames}>
            <div className={iconClassName} />
            <div className="dm-button-title s-drill-config-item-title" title={title}>
                {title}
            </div>
            {!readonly ? (
                <div className="dm-button-delete-wrapper">
                    <Button
                        className="drill-config-item-delete gd-button-link gd-button-icon-only gd-icon-cross s-drill-config-item-delete"
                        onClick={onDelete}
                    />
                </div>
            ) : null}
        </div>
    );
};
