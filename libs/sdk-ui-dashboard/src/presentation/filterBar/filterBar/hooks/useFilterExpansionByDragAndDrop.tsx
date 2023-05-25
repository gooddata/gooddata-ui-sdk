// (C) 2022 GoodData Corporation

import { useEffect, useRef } from "react";
import { useDashboardDrop } from "../../../dragAndDrop/index.js";

export function useFilterExpansionByDragAndDrop(
    containsMultipleRows: boolean,
    isFilterBarExpanded: boolean,
    setFilterBarExpanded: (isFilterBarExpanded: boolean) => void,
) {
    const lastCanDrop = useRef<boolean>(false);
    const lastMultiRows = useRef<boolean>(false);
    const shouldBeExpandedAfterDrop = useRef<boolean>(false);

    const [{ canDrop }, dropRef] = useDashboardDrop(
        ["attributeFilter", "attributeFilter-placeholder"],
        {
            drop: (_, monitor) => {
                if (monitor.didDrop()) {
                    shouldBeExpandedAfterDrop.current = true;
                }
            },
        },
        [],
    );

    useEffect(() => {
        const dragStateUnchanged = canDrop === lastCanDrop.current;
        const multiRowsUnchanged = containsMultipleRows === lastMultiRows.current;

        if (dragStateUnchanged && multiRowsUnchanged) {
            return;
        }

        if (canDrop && containsMultipleRows) {
            shouldBeExpandedAfterDrop.current = isFilterBarExpanded;
            setFilterBarExpanded(true);
        } else if (shouldBeExpandedAfterDrop.current !== isFilterBarExpanded) {
            setFilterBarExpanded(shouldBeExpandedAfterDrop.current);
            shouldBeExpandedAfterDrop.current = false;
        }
        lastCanDrop.current = canDrop;
        lastMultiRows.current = containsMultipleRows;
    }, [canDrop, containsMultipleRows, isFilterBarExpanded, setFilterBarExpanded]);

    return dropRef;
}
