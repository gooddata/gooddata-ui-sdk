// (C) 2007-2026 GoodData Corporation

import { type ReactElement, memo } from "react";

import { LegacySingleSelectList } from "@gooddata/sdk-ui-kit";

import { type IOperandDropdownItem } from "./model/operand_dropdown_item.js";
import { OperandDropdownItem } from "./OperandDropdownItem.js";

const MAX_LIST_ITEMS = 10;
const LIST_ITEM_HEIGHT = 23;

export interface IOperandDropdownBodyProps {
    width: number;
    measures: IOperandDropdownItem[];
    selectedMeasureLocalIdentifier: string | null;
    onSelect: (selectedMeasureLocalIdentifier: string) => void;
    onItemMouseEnter: (localIdentifier: string) => void;
    onItemMouseLeave: () => void;
}

export const OperandDropdownBody = memo(function OperandDropdownBody({
    width,
    measures,
    selectedMeasureLocalIdentifier,
    onSelect,
    onItemMouseEnter,
    onItemMouseLeave,
}: IOperandDropdownBodyProps): ReactElement {
    const getSelectedItem = (): IOperandDropdownItem => {
        return measures.find((item) => item.localIdentifier === selectedMeasureLocalIdentifier);
    };

    const onSelectHandler = (item: IOperandDropdownItem): void => {
        onSelect(item.localIdentifier);
    };

    const selectedItem = getSelectedItem();
    const measuresCount = measures.length;
    const listHeight = (measuresCount > MAX_LIST_ITEMS ? MAX_LIST_ITEMS : measuresCount) * LIST_ITEM_HEIGHT;

    return (
        <div className="adi-am-selector-list s-adi-am-selector-list">
            <LegacySingleSelectList
                items={measures}
                itemsCount={measuresCount}
                itemHeight={LIST_ITEM_HEIGHT}
                listItemClass={OperandDropdownItem}
                height={listHeight}
                width={width}
                selection={selectedItem}
                onSelect={onSelectHandler}
                onItemMouseEnter={onItemMouseEnter}
                onItemMouseLeave={onItemMouseLeave}
            />
        </div>
    );
});
