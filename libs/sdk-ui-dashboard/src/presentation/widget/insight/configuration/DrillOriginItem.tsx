// (C) 2019-2025 GoodData Corporation

import { Button } from "@gooddata/sdk-ui-kit";

export interface IDrillOriginItemProps {
    title: string;
    type: string;
    onDelete: () => void;
    isDateAttribute: boolean;
}

const getIconType = (type: string, isDateAttribute: boolean) => {
    if (isDateAttribute) {
        return "date";
    }

    if (type === "measure") {
        return "metric";
    }

    return type;
};

export function DrillOriginItem({ onDelete, title, type, isDateAttribute }: IDrillOriginItemProps) {
    const iconType = getIconType(type, isDateAttribute);
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
}
