// (C) 2019 GoodData Corporation
import * as React from "react";
import { IAttributeElement } from "@gooddata/sdk-model";

import { AttributeDropdownList } from "./AttributeDropdownList";
import { AttributeDropdownButtons } from "./AttributeDropdownButtons";

interface IAttributeDropdownBodyProps {
    items: IAttributeElement[];
    totalCount: number;
    selectedItems: IAttributeElement[];
    isInverted: boolean;
    isLoading: boolean;
    error?: any;
    applyDisabled?: boolean;

    onSelect: (selectedItems: IAttributeElement[], isInverted: boolean) => void;
    onRangeChange: (searchString: string, from: number, to: number) => void;
    onApplyButtonClicked: () => void;
    onCloseButtonClicked: () => void;
}

export const AttributeDropdownBody: React.FC<IAttributeDropdownBodyProps> = ({
    items,
    totalCount,
    error,
    isLoading,
    selectedItems,
    isInverted,
    applyDisabled,
    onRangeChange,
    onSelect,
    onApplyButtonClicked,
    onCloseButtonClicked,
}) => {
    return (
        <div className="gd-attribute-filter-overlay">
            <AttributeDropdownList
                error={error}
                isLoading={isLoading}
                items={items}
                isInverted={isInverted}
                onRangeChange={onRangeChange}
                selectedItems={selectedItems}
                totalCount={totalCount}
                onSelect={onSelect}
            />
            <AttributeDropdownButtons
                applyDisabled={applyDisabled}
                onApplyButtonClicked={onApplyButtonClicked}
                onCloseButtonClicked={onCloseButtonClicked}
            />
        </div>
    );
};
