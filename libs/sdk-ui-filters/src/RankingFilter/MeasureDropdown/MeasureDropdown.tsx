// (C) 2020-2026 GoodData Corporation

import { useState } from "react";

import cx from "classnames";

import { type ObjRefInScope, areObjRefsEqual } from "@gooddata/sdk-model";
import { Button } from "@gooddata/sdk-ui-kit";

import { type IMeasureDropdownItem, type RenderMeasureDropdownBody } from "../types.js";

import { MeasureDropdownBody } from "./MeasureDropdownBody.js";

interface IMeasureDropdownProps {
    items: IMeasureDropdownItem[];
    selectedItemRef: ObjRefInScope;
    onSelect: (ref: ObjRefInScope) => void;
    onDropDownItemMouseOver?: (ref: ObjRefInScope) => void;
    onDropDownItemMouseOut?: () => void;
    /**
     * Optional custom renderer for the dropdown body. When provided, it replaces the built-in flat
     * measure list (the anchor button is kept).
     */
    renderMeasureDropdownBody?: RenderMeasureDropdownBody;
}

export function MeasureDropdown({
    items,
    selectedItemRef,
    onSelect,
    onDropDownItemMouseOver,
    onDropDownItemMouseOut,
    renderMeasureDropdownBody,
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
            {isOpen
                ? (renderMeasureDropdownBody?.({
                      selectedItemRef,
                      onSelect: onItemSelect,
                      onClose: () => setIsOpen(false),
                  }) ?? (
                      <MeasureDropdownBody
                          items={items}
                          selectedItemRef={selectedItemRef}
                          onSelect={onItemSelect}
                          onClose={() => setIsOpen(false)}
                          onDropDownItemMouseOver={onDropDownItemMouseOver}
                          onDropDownItemMouseOut={onDropDownItemMouseOut}
                      />
                  ))
                : null}
        </>
    );
}
