// (C) 2019-2025 GoodData Corporation
import React, { memo } from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";
import {
    Dropdown,
    DropdownList,
    DropdownButton,
    SingleSelectListItem,
    ISingleSelectListItemProps,
    IAlignPoint,
} from "@gooddata/sdk-ui-kit";
import cloneDeep from "lodash/cloneDeep.js";
import set from "lodash/set.js";

import DisabledBubbleMessage from "../DisabledBubbleMessage.js";
import { getTranslation } from "../../utils/translations.js";
import { IVisualizationProperties } from "../../interfaces/Visualization.js";
import { IDropdownItem } from "../../interfaces/Dropdown.js";

export interface IDropdownControlProps {
    valuePath: string;
    properties: IVisualizationProperties;
    labelText?: string;
    value?: string | number;
    items?: IDropdownItem[];
    disabled?: boolean;
    width?: number;
    showDisabledMessage?: boolean;
    disabledMessageAlignPoints?: IAlignPoint[];
    customListItem?: React.ComponentType<ISingleSelectListItemProps>;

    pushData(data: any): void;
}

const alignPoints = ["bl tl", "tl bl", "br tr", "tr br"];

const DROPDOWN_ALIGNMENTS = alignPoints.map((align) => ({ align, offset: { x: 1, y: 0 } }));

const DropdownControl = memo(function DropdownControl({
    valuePath,
    properties,
    labelText,
    value = "",
    items = [] as IDropdownItem[],
    disabled = false,
    width = 117,
    showDisabledMessage = false,
    disabledMessageAlignPoints,
    customListItem: ListItem = SingleSelectListItem,
    pushData,
    intl,
}: IDropdownControlProps & WrappedComponentProps) {
    const getSelectedItem = (value: string | number): IDropdownItem => {
        if (items) {
            return items.find((item) => item.value === value);
        }

        return undefined;
    };

    const onSelect = (selectedItem: IDropdownItem) => {
        // we must not change the properties at any cost, so deep clone for now.
        // ideally we should use st. like immer with copy on write to not clone everything all the time
        const clonedProperties = cloneDeep(properties);
        set(clonedProperties, `controls.${valuePath}`, selectedItem.value);

        pushData({ properties: clonedProperties });
    };

    const getDropdownButton = (
        selectedItem: IDropdownItem,
        disabled: boolean,
        isOpen: boolean,
        toggleDropdown: () => void,
    ) => {
        const { icon, title } = selectedItem;

        return (
            <DropdownButton
                value={title}
                iconLeft={icon}
                isOpen={isOpen}
                onClick={toggleDropdown}
                disabled={disabled}
            />
        );
    };

    const selectedItem = getSelectedItem(value) || {};

    return (
        <DisabledBubbleMessage
            showDisabledMessage={showDisabledMessage}
            alignPoints={disabledMessageAlignPoints}
        >
            <div className="adi-properties-dropdown-container">
                <span className="input-label-text">{getTranslation(labelText, intl)}</span>
                <label className="adi-bucket-inputfield gd-input gd-input-small">
                    <Dropdown
                        renderButton={({ isOpen, toggleDropdown }) => {
                            return getDropdownButton(selectedItem, disabled, isOpen, toggleDropdown);
                        }}
                        closeOnParentScroll={true}
                        closeOnMouseDrag={true}
                        alignPoints={DROPDOWN_ALIGNMENTS}
                        renderBody={({ closeDropdown, isMobile }) => {
                            return (
                                <DropdownList
                                    width={width}
                                    isMobile={isMobile}
                                    items={items}
                                    renderItem={({ item }) => (
                                        <ListItem
                                            title={item.title}
                                            isSelected={item.value === selectedItem.value}
                                            onClick={() => {
                                                onSelect(item);
                                                closeDropdown();
                                            }}
                                            type={item.type}
                                            icon={item.icon}
                                            info={item.info}
                                        />
                                    )}
                                />
                            );
                        }}
                        className="adi-bucket-dropdown"
                    />
                </label>
            </div>
        </DisabledBubbleMessage>
    );
});

export default injectIntl(DropdownControl);
