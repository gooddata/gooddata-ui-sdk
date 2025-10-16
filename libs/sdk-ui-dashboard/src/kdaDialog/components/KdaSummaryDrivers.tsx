// (C) 2025 GoodData Corporation

import { RefObject, useCallback, useMemo } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import {
    UiAsyncTable,
    UiAsyncTableColumn,
    UiAsyncTableScrollbarWidth,
    useElementSize,
} from "@gooddata/sdk-ui-kit";

import { KdaItem, KdaItemGroup } from "../internalTypes.js";
import { driverColumn } from "./columns/driverColumn.js";
import { driversCountColumn } from "./columns/driversCount.js";
import { titleColumn } from "./columns/titleColumn.js";
import { useSummaryDrivers } from "../hooks/useSummaryDrivers.js";
import { useKdaState } from "../providers/KdaState.js";

export function KdaSummaryDrivers() {
    const { ref, width, height } = useElementSize();
    const intl = useIntl();

    const { state, setState } = useKdaState();
    const onSelect = useCallback(
        (item: KdaItem) => {
            const selectedItem = state.items.find(({ data }) => data === item);
            setState({
                selectedItem: selectedItem ?? "summary",
            });
        },
        [setState, state.items],
    );
    const list = useSummaryDrivers();

    const columns = useMemo(() => {
        const columnWidth = [200, 200, width - 400 - (list.length > 6 ? UiAsyncTableScrollbarWidth : 0)];
        return [
            titleColumn(intl, columnWidth[0]),
            driverColumn(intl, columnWidth[1], onSelect),
            driversCountColumn(intl, columnWidth[2]),
        ] as UiAsyncTableColumn<KdaItemGroup>[];
    }, [intl, width, list, onSelect]);

    return (
        <div className={cx("gd-kda-key-drivers-summary")}>
            <div className={cx("gd-kda-key-drivers-summary-list")} ref={ref as RefObject<HTMLDivElement>}>
                <UiAsyncTable
                    items={list}
                    totalItemsCount={list.length}
                    columns={columns}
                    width={width}
                    maxHeight={height - 45}
                    hasNextPage={false}
                    filters={[]}
                />
            </div>
        </div>
    );
}
