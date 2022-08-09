// (C) 2019-2022 GoodData Corporation
import React from "react";
import { Button } from "@gooddata/sdk-ui-kit";

export interface IDrillMeasureItemProps {
    title: string;
    localIdentifier: string;
    onDelete: (localIdentifier: string) => void;
}

export const DrillMeasureItem: React.FunctionComponent<IDrillMeasureItemProps> = ({
    localIdentifier,
    onDelete,
    title,
}) => {
    const onClick = () => {
        onDelete(localIdentifier);
    };

    return (
        <div className="gd-drill-config-measure-item">
            <div className="dm-button-icon" />
            <div className="dm-button-title s-drill-config-item-title" title={title}>
                {title}
            </div>
            <div className="dm-button-delete-wrapper">
                <Button
                    className="drill-config-item-delete gd-button-link gd-button-icon-only icon-cross s-drill-config-item-delete"
                    onClick={onClick}
                />
            </div>
        </div>
    );
};
