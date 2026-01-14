// (C) 2020-2026 GoodData Corporation

import { useState } from "react";

import cx from "classnames";
import { FormattedMessage, type IntlShape, useIntl } from "react-intl";

import { type ObjRefInScope, areObjRefsEqual } from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger, Button } from "@gooddata/sdk-ui-kit";

import { AttributeDropdownBody } from "./AttributeDropdownBody.js";
import { type IAttributeDropdownItem, type ICustomGranularitySelection } from "../types.js";

const getItemTitle = (selectedItem: IAttributeDropdownItem | undefined, intl: IntlShape): string =>
    selectedItem ? selectedItem.title : intl.formatMessage({ id: "rankingFilter.allRecords" });

const getItemIcon = (selectedItem: IAttributeDropdownItem | undefined): string | undefined => {
    if (selectedItem) {
        return selectedItem.type === "DATE" ? "gd-icon-date" : "gd-icon-attribute";
    } else {
        return undefined;
    }
};

interface IAttributeDropdownProps {
    items: IAttributeDropdownItem[];
    selectedItemRef?: ObjRefInScope;
    onSelect: (ref?: ObjRefInScope) => void;
    onDropDownItemMouseOver?: (ref: ObjRefInScope) => void;
    onDropDownItemMouseOut?: () => void;
    customGranularitySelection?: ICustomGranularitySelection;
}

export function AttributeDropdown({
    items,
    selectedItemRef,
    onSelect,
    onDropDownItemMouseOver,
    onDropDownItemMouseOut,
    customGranularitySelection,
}: IAttributeDropdownProps) {
    const intl = useIntl();

    const [isOpen, setIsOpen] = useState(false);
    const isDisabled = items.length === 1;

    const onButtonClick = () => {
        setIsOpen(!isOpen);
    };

    const onItemSelect = (ref?: ObjRefInScope) => {
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
            <Button className={buttonClassNames} value={itemTitle} disabled />
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
}
