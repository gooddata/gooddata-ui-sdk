// (C) 2019-2022 GoodData Corporation
import React from "react";
import InsightDrillConfigItem from "./InsightDrillConfigItem";
import { IDrillConfigItem } from "../../../drill/types";
import { IDrillTargetType } from "./useDrillTargetTypeItems";
import { InsightDrillDefinition } from "@gooddata/sdk-model";

// import { DrillActionTarget, IDrillConfigItem } from "../../../../modules/Drilling";
// import { IDropdownItem } from "../../../../modules/Core/typings/DropdownItem";

// import DrillConfigItem from "./DrillConfigItem";

export interface IDrillConfigListProps {
    drillConfigItems?: IDrillConfigItem[];
    // onDelete: (item: IDrillConfigItem) => void;
    onSetup: (drill: InsightDrillDefinition) => void;
    // onIncompleteChange: (changedItem: IDrillConfigItem) => void;
    enabledDrillTargetTypeItems: IDrillTargetType[];
}

export const InsightDrillConfigList: React.FunctionComponent<IDrillConfigListProps> = (props) => {
    return (
        <div className="s-drill-config-list">
            {props.drillConfigItems?.map((item) => (
                <InsightDrillConfigItem
                    item={item}
                    key={item.localIdentifier}
                    // onDelete={props.onDelete}
                    onSetup={props.onSetup}
                    // onIncompleteChange={props.onIncompleteChange}
                    enabledDrillTargetTypeItems={props.enabledDrillTargetTypeItems}
                />
            ))}
        </div>
    );
};
