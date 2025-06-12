// (C) 2019-2022 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";
import { IAvailableDrillTargetMeasure } from "@gooddata/sdk-ui";

import DrillMeasureSelectorBody from "./DrillMeasureSelectorBody.js";
import { Dropdown, DropdownButton } from "@gooddata/sdk-ui-kit";

export interface IDrillMeasureSelectorProps {
    items: IAvailableDrillTargetMeasure[];
    onSelect: (item: IAvailableDrillTargetMeasure) => void;
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

export const DrillMeasureSelector: React.FunctionComponent<IDrillMeasureSelectorProps> = (props) => {
    // const refDropdown = React.useRef(null);
    //
    const onCloseDropdown = () => {
        // refDropdown.current.closeDropdown();
    };

    const intl = useIntl();

    const onSelect = (selected: IAvailableDrillTargetMeasure) => {
        props.onSelect(selected);
        onCloseDropdown();
    };

    if (!props.items.length) {
        return null;
    }

    return (
        <Dropdown
            className="gd-drill-measure-selector"
            closeOnParentScroll={true}
            closeOnMouseDrag={false}
            closeOnOutsideClick={true}
            alignPoints={DROPDOWN_ALIGN_POINTS}
            renderButton={({ toggleDropdown }) => (
                <DropdownButton
                    value={intl.formatMessage({ id: "configurationPanel.drillConfig.addInteraction" })}
                    iconLeft="icon-add"
                    className="s-drill-show-measures customizable"
                    onClick={toggleDropdown}
                />
            )}
            renderBody={() => (
                <DrillMeasureSelectorBody
                    supportedItems={props.items}
                    onSelect={onSelect}
                    onCloseDropdown={onCloseDropdown}
                />
            )}
        />
    );
};
