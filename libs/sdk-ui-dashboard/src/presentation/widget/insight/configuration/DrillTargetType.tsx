// (C) 2020-2022 GoodData Corporation
import React from "react";
import { Dropdown, DropdownList, SingleSelectListItem } from "@gooddata/sdk-ui-kit";
import { useIntl } from "react-intl";

import { ButtonWithIcon } from "./ButtonWithIcon.js";
import { DRILL_TARGET_TYPE } from "../../../drill/types.js";
import { IDrillTargetType } from "./useDrillTargetTypeItems.js";

export interface IDrillTargetProps {
    onSelect: (target: DRILL_TARGET_TYPE) => void;
    selection?: DRILL_TARGET_TYPE;
    enabledDrillTargetTypeItems: IDrillTargetType[];
}

const ITEM_HEIGHT = 25;
const DROPDOWN_BODY_WIDTH = 200;

const getTargetBySelection = (
    selection: DRILL_TARGET_TYPE | undefined,
    targets: IDrillTargetType[],
): IDrillTargetType | undefined => {
    return targets.find((target: IDrillTargetType) => target.id === selection);
};

const getIconClassNameBySelection = (selection: DRILL_TARGET_TYPE | undefined) => {
    const icons = {
        [DRILL_TARGET_TYPE.DRILL_TO_DASHBOARD]: "gd-icon-drill-to-dashboard",
        [DRILL_TARGET_TYPE.DRILL_TO_INSIGHT]: "gd-icon-drill-to-insight",
        [DRILL_TARGET_TYPE.DRILL_TO_URL]: "gd-icon-hyperlink-disabled",
    };

    return selection ? icons[selection] : undefined;
};

export const DrillTargetType: React.FunctionComponent<IDrillTargetProps> = (props) => {
    const { selection, enabledDrillTargetTypeItems } = props;
    const intl = useIntl();
    const targetBySelection = getTargetBySelection(selection, enabledDrillTargetTypeItems);
    const buttonValue = targetBySelection
        ? targetBySelection.title
        : intl.formatMessage({ id: "configurationPanel.drillConfig.select" });

    const onSelect = (target: IDrillTargetType) => {
        props.onSelect(target.id as DRILL_TARGET_TYPE);
    };

    return (
        <Dropdown
            closeOnParentScroll={true}
            closeOnMouseDrag={false}
            closeOnOutsideClick={true}
            alignPoints={[
                {
                    align: "bl tl",
                },
                {
                    align: "tl bl",
                },
            ]}
            renderButton={({ isOpen, toggleDropdown }) => (
                <ButtonWithIcon
                    className="s-drill-config-panel-target-button"
                    value={buttonValue}
                    icon={getIconClassNameBySelection(selection)}
                    isOpen={isOpen}
                    onClick={toggleDropdown}
                />
            )}
            renderBody={({ closeDropdown }) => (
                <DropdownList
                    width={DROPDOWN_BODY_WIDTH}
                    itemHeight={ITEM_HEIGHT}
                    items={enabledDrillTargetTypeItems}
                    className="gd-drill-config-panel-target s-drill-config-panel-target-type-open"
                    renderItem={({ item }) => {
                        const isSelected = targetBySelection && targetBySelection.id === item.id;
                        const drillIconClassName = getIconClassNameBySelection(item.id);

                        return (
                            <SingleSelectListItem
                                className={drillIconClassName}
                                title={item.title}
                                isSelected={isSelected}
                                onClick={() => {
                                    onSelect(item);
                                    closeDropdown();
                                }}
                            />
                        );
                    }}
                />
            )}
        />
    );
};
