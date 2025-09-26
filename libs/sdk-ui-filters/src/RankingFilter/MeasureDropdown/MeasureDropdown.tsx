// (C) 2020-2025 GoodData Corporation

import { useState } from "react";

import cx from "classnames";

import { ObjRefInScope, areObjRefsEqual } from "@gooddata/sdk-model";
import { Button } from "@gooddata/sdk-ui-kit";

import { MeasureDropdownBody } from "./MeasureDropdownBody.js";
import { IMeasureDropdownItem } from "../types.js";

interface IMeasureDropdownProps {
    items: IMeasureDropdownItem[];
    selectedItemRef: ObjRefInScope;
    onSelect: (ref: ObjRefInScope) => void;
    onDropDownItemMouseOver?: (ref: ObjRefInScope) => void;
    onDropDownItemMouseOut?: () => void;
}

export function MeasureDropdown({
    items,
    selectedItemRef,
    onSelect,
    onDropDownItemMouseOver,
    onDropDownItemMouseOut,
}: IMeasureDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);

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
        "gd-rf-measure-dropdown-button",
        "s-rf-measure-dropdown-button",
    );

    const selectedItem = items.find((item) => areObjRefsEqual(item.ref, selectedItemRef));
    const title = selectedItem?.title;

    return (
        <>
            <Button
                className={buttonClassNames}
                value={title}
                onClick={onButtonClick}
                iconLeft={"gd-icon-metric"}
            />
            {isOpen ? (
                <MeasureDropdownBody
                    items={items}
                    selectedItemRef={selectedItemRef}
                    onSelect={onItemSelect}
                    onClose={() => setIsOpen(false)}
                    onDropDownItemMouseOver={onDropDownItemMouseOver}
                    onDropDownItemMouseOut={onDropDownItemMouseOut}
                />
            ) : null}
        </>
    );
}
