// (C) 2023-2025 GoodData Corporation

import { AttributeDropdown } from "./AttributeDropdown.js";
import { AttributeItemActions } from "./AttributeItemActions.js";
import { IAttributeData } from "./types.js";

interface IAttributeItemCellProps {
    rowIndex: number;
    attribute: IAttributeData;
}

export function AttributeItem({ rowIndex, attribute }: IAttributeItemCellProps) {
    const { title, completed, icon } = attribute;

    return (
        <div className="gd-list-item">
            <div className="attribute-item-content s-attribute-item-content">
                {completed ? (
                    <div className="attribute-item-title s-attribute-item-title">
                        <i className={icon} />
                        {title}
                        <i className="gd-icon-navigatedown" />
                    </div>
                ) : (
                    <AttributeDropdown rowIndex={rowIndex} />
                )}
            </div>
            {completed ? <AttributeItemActions rowIndex={rowIndex} /> : null}
        </div>
    );
}
