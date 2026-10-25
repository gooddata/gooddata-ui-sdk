// (C) 2019-2026 GoodData Corporation

import { type IFilterBarListProps } from "../FilterBarList.js";

export function FilterBarList(props: IFilterBarListProps) {
    return (
        <div>
            {props.filterItems.map((item) => (
                <div key={item.localIdentifier}>{item.localIdentifier}</div>
            ))}
        </div>
    );
}
