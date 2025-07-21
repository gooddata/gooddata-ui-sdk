// (C) 2019-2025 GoodData Corporation
import { useIntl } from "react-intl";
import { IAvailableDrillTargets } from "@gooddata/sdk-ui";
import { Dropdown, DropdownButton } from "@gooddata/sdk-ui-kit";
import { ObjRef } from "@gooddata/sdk-model";

import DrillOriginSelectorBody from "./DrillOriginSelectorBody.js";
import { IAvailableDrillTargetItem } from "../../../../drill/DrillSelect/types.js";
import { useDashboardUserInteraction } from "../../../../../model/index.js";

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

export function DrillOriginSelector(props: IDrillOriginSelectorProps) {
    const { items, widgetRef } = props;

    const onSelect = (selected: IAvailableDrillTargetItem) => {
        props.onSelect(selected, widgetRef);
    };
    const intl = useIntl();

    const { addInteractionClicked } = useDashboardUserInteraction();

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
                    onClick={() => {
                        toggleDropdown();
                        if (!isOpen) {
                            addInteractionClicked();
                        }
                    }}
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
}
