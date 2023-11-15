// (C) 2019-2022 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";
import { IAvailableDrillTargets } from "@gooddata/sdk-ui";
import { Dropdown, DropdownButton } from "@gooddata/sdk-ui-kit";

import DrillOriginSelectorBody from "./DrillOriginSelectorBody.js";
import { IAvailableDrillTargetItem } from "../../../../drill/DrillSelect/types.js";
import { ObjRef } from "@gooddata/sdk-model";

export interface IDrillOriginSelectorProps {
    items: IAvailableDrillTargets;
    onSelect: (item: IAvailableDrillTargetItem, widgetRef: ObjRef) => void;
    widgetRef: ObjRef;
}

const DROPDOWN_ALIGN_POINTS = [
    {
        align: "bl tl",
        offset: {
            x: 0,
            y: 4,
        },
    },
    {
        align: "tl bl",
        offset: {
            x: 0,
            y: -4,
        },
    },
];

export const DrillOriginSelector: React.FunctionComponent<IDrillOriginSelectorProps> = (props) => {
    const { items, widgetRef } = props;

    const onSelect = (selected: IAvailableDrillTargetItem) => {
        props.onSelect(selected, widgetRef);
    };
    const intl = useIntl();

    if (!items.measures?.length && !items.attributes?.length) {
        return null;
    }

    return (
        <Dropdown
            className="gd-drill-origin-selector"
            closeOnParentScroll={true}
            closeOnMouseDrag={false}
            closeOnOutsideClick={true}
            alignPoints={DROPDOWN_ALIGN_POINTS}
            renderButton={({ isOpen, toggleDropdown }) => (
                <DropdownButton
                    value={intl.formatMessage({ id: "configurationPanel.drillConfig.addInteraction" })}
                    iconLeft="gd-icon-add"
                    className="s-drill-show-measures customizable"
                    isOpen={isOpen}
                    onClick={toggleDropdown}
                />
            )}
            renderBody={({ closeDropdown }) => (
                <DrillOriginSelectorBody
                    supportedItems={items}
                    onSelect={onSelect}
                    onCloseDropdown={closeDropdown}
                />
            )}
        />
    );
};
