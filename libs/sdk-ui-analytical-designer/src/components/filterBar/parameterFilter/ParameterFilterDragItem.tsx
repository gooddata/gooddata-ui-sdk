// (C) 2026 GoodData Corporation

import { type IParameterFilter } from "../../../store/filter_bar/parameter_filter_types.js";

export interface IParameterFilterDragItemProps {
    filter: IParameterFilter;
}

export function ParameterFilterDragItem({ filter }: IParameterFilterDragItemProps) {
    return (
        <div className="adi-filter-button adi-filter-button-hover s-filter-drag-item s-filter-button s-parameter-filter-button gd-button">
            <span className="gd-button-text">
                <div>
                    <div className="adi-filter-title adi-filter-selection">
                        <span className="shortened is-whole">{filter.name}</span>
                    </div>
                </div>
            </span>
        </div>
    );
}
