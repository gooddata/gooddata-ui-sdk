// (C) 2020-2022 GoodData Corporation
import React, { useState } from "react";
import { Button, Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";
import { ObjRefInScope, areObjRefsEqual } from "@gooddata/sdk-model";
import cx from "classnames";
import { IAttributeDropdownItem, ICustomGranularitySelection } from "../types.js";
import { AttributeDropdownBody } from "./AttributeDropdownBody.js";
import { IntlShape, WrappedComponentProps, injectIntl, FormattedMessage } from "react-intl";

const getItemTitle = (selectedItem: IAttributeDropdownItem, intl: IntlShape): string =>
    selectedItem ? selectedItem.title : intl.formatMessage({ id: "rankingFilter.allRecords" });

const getItemIcon = (selectedItem: IAttributeDropdownItem): string => {
    if (selectedItem) {
        return selectedItem.type === "DATE" ? "gd-icon-date" : "gd-icon-attribute";
    } else {
        return null;
    }
};

interface IAttributeDropdownComponentProps {
    items: IAttributeDropdownItem[];
    selectedItemRef: ObjRefInScope;
    onSelect: (ref?: ObjRefInScope) => void;
    onDropDownItemMouseOver?: (ref: ObjRefInScope) => void;
    onDropDownItemMouseOut?: () => void;
    customGranularitySelection?: ICustomGranularitySelection;
}

type AttributeDropdownProps = IAttributeDropdownComponentProps & WrappedComponentProps;

const AttributeDropdownComponent: React.FC<AttributeDropdownProps> = ({
    items,
    selectedItemRef,
    onSelect,
    onDropDownItemMouseOver,
    onDropDownItemMouseOut,
    customGranularitySelection,
    intl,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const isDisabled = items.length === 1;

    const onButtonClick = () => {
        setIsOpen(!isOpen);
    };

    const onItemSelect = (ref: ObjRefInScope) => {
        onSelect(ref);
        setIsOpen(false);
        onDropDownItemMouseOut?.();
    };

    const buttonClassNames = cx(
        "gd-button-secondary",
        "gd-button-small",
        "button-dropdown",
        "gd-icon-right",
        {
            "gd-icon-navigateup": isOpen,
            "gd-icon-navigatedown": !isOpen,
        },
        "gd-rf-attribute-dropdown-button",
        "s-rf-attribute-dropdown-button",
    );

    const selectedAttributeItem = items.find((item) => areObjRefsEqual(item.ref, selectedItemRef));
    const itemTitle = getItemTitle(selectedAttributeItem, intl);

    return isDisabled ? (
        <BubbleHoverTrigger showDelay={0} hideDelay={0}>
            <Button className={buttonClassNames} value={itemTitle} disabled={true} />
            <Bubble
                className={`bubble-primary gd-rf-tooltip-bubble s-rf-attribute-no-options-bubble`}
                alignPoints={[{ align: "cr cl" }, { align: "cl cr" }]}
            >
                <FormattedMessage id="rankingFilter.attributeDropdown.oneAttributeTooltip" />
            </Bubble>
        </BubbleHoverTrigger>
    ) : (
        <>
            <Button
                className={buttonClassNames}
                value={itemTitle}
                onClick={onButtonClick}
                iconLeft={getItemIcon(selectedAttributeItem)}
            />
            {isOpen ? (
                <AttributeDropdownBody
                    items={items}
                    selectedItemRef={selectedItemRef}
                    onSelect={onItemSelect}
                    onClose={() => setIsOpen(false)}
                    onDropDownItemMouseOver={onDropDownItemMouseOver}
                    onDropDownItemMouseOut={onDropDownItemMouseOut}
                    customGranularitySelection={customGranularitySelection}
                />
            ) : null}
        </>
    );
};

export const AttributeDropdown = injectIntl(AttributeDropdownComponent);
