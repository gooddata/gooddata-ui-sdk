// (C) 2019 GoodData Corporation
import * as React from "react";
import { IElement } from "@gooddata/sdk-backend-spi";

import { AttributeDropdownList } from "./AttributeDropdownList";
import { AttributeDropdownButtons } from "./AttributeDropdownButtons";

interface IAttributeDropdownBodyProps {
    items: IElement[];
    totalCount: number;
    selectedItems: IElement[];
    isInverted: boolean;
    isLoading: boolean;
    error?: any;
    applyDisabled?: boolean;

    onSelect: (selectedItems: IElement[], isInverted: boolean) => void;
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
