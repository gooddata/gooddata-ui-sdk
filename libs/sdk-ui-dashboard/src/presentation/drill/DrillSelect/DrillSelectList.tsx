// (C) 2019-2022 GoodData Corporation
import React from "react";
import partition from "lodash/partition";
import { FormattedMessage } from "react-intl";
import { DashboardDrillDefinition, isDrillDownDefinition } from "../../../types";
import { DrillSelectListItem } from "./DrillSelectListItem";
import { DrillSelectItem } from "./types";

export interface DrillSelectListProps {
    items: DrillSelectItem[];
    onSelect: (item: DashboardDrillDefinition) => void;
}

export const DrillSelectList: React.FunctionComponent<DrillSelectListProps> = (props) => {
    const { items } = props;

    const [drillDownItems, drillItems] = partition(items, (item: DrillSelectItem) => {
        return isDrillDownDefinition(item.drillDefinition);
    });

    const renderItems = (items: DrillSelectItem[]) => {
        return items.map((item) => (
            <DrillSelectListItem key={item.id} item={item} onClick={props.onSelect} />
        ));
    };

    const renderDrillDownItems = (items: DrillSelectItem[]) => {
        if (items?.length > 0) {
            return (
                <>
                    <div className="gd-drill-modal-picker-title">
                        <FormattedMessage id="drill_modal_picker.drill-down" tagName="span" />
                    </div>
                    {renderItems(items)}
                </>
            );
        }
    };

    const renderDrillItems = (items: DrillSelectItem[]) => {
        if (items?.length > 0) {
            return (
                <>
                    <div className="gd-drill-modal-picker-title">
                        <FormattedMessage id="drill_modal_picker.drill-into" tagName="span" />
                    </div>
                    {renderItems(items)}
                </>
            );
        }
    };

    return (
        <div className="gd-drill-modal-picker-selector-list">
            {renderDrillDownItems(drillDownItems)}
            {renderDrillItems(drillItems)}
        </div>
    );
};
