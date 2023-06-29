// (C) 2019 GoodData Corporation
import React from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";
import { Dropdown, DropdownList, DropdownButton, SingleSelectListItem } from "@gooddata/sdk-ui-kit";
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
    value?: string;
    items?: IDropdownItem[];
    disabled?: boolean;
    width?: number;
    showDisabledMessage?: boolean;

    pushData(data: any): void;
}

const alignPoints = ["bl tl", "tl bl", "br tr", "tr br"];

const DROPDOWN_ALIGNMENTS = alignPoints.map((align) => ({ align, offset: { x: 1, y: 0 } }));

class DropdownControl extends React.PureComponent<IDropdownControlProps & WrappedComponentProps> {
    public static defaultProps = {
        value: "",
        items: [] as IDropdownItem[],
        disabled: false,
        width: 117,
        showDisabledMessage: false,
    };

    constructor(props: IDropdownControlProps & WrappedComponentProps) {
        super(props);
        this.onSelect = this.onSelect.bind(this);
        this.getSelectedItem = this.getSelectedItem.bind(this);
    }

    public render() {
        const { disabled, labelText, value, width, items, showDisabledMessage, intl } = this.props;
        const selectedItem = this.getSelectedItem(value) || {};

        return (
            <DisabledBubbleMessage showDisabledMessage={showDisabledMessage}>
                <div className="adi-properties-dropdown-container">
                    <span className="input-label-text">{getTranslation(labelText, intl)}</span>
                    <label className="adi-bucket-inputfield gd-input gd-input-small">
                        <Dropdown
                            renderButton={({ isOpen, toggleDropdown }) => {
                                return this.getDropdownButton(selectedItem, disabled, isOpen, toggleDropdown);
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
                                            <SingleSelectListItem
                                                title={item.title}
                                                isSelected={item.value === selectedItem.value}
                                                onClick={() => {
                                                    this.onSelect(item);
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
    }

    private getDropdownButton(
        selectedItem: IDropdownItem,
        disabled: boolean,
        isOpen: boolean,
        toggleDropdown: () => void,
    ) {
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
    }

    private onSelect(selectedItem: IDropdownItem) {
        const { valuePath, properties, pushData } = this.props;

        // we must not change the properties at any cost, so deep clone for now.
        // ideally we should use st. like immer with copy on write to not clone everything all the time
        const clonedProperties = cloneDeep(properties);
        set(clonedProperties, `controls.${valuePath}`, selectedItem.value);

        pushData({ properties: clonedProperties });
    }

    private getSelectedItem(value: string): IDropdownItem {
        if (this.props.items) {
            return this.props.items.find((item) => item.value === value);
        }

        return undefined;
    }
}

export default injectIntl(DropdownControl);
