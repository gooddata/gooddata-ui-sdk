// (C) 2025 GoodData Corporation

import { RefObject, useMemo } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import {
    UiAsyncTable,
    UiAsyncTableColumn,
    UiAsyncTableScrollbarWidth,
    UiButton,
    useElementSize,
} from "@gooddata/sdk-ui-kit";

import { KdaItem } from "../internalTypes.js";
import { useKdaState } from "../providers/KdaState.js";
import { driverColumn } from "./columns/driverColumn.js";
import { driversCountColumn } from "./columns/driversCount.js";
import { titleColumn } from "./columns/titleColumn.js";

export function KdaSummaryDrivers() {
    const { ref, width, height } = useElementSize();
    const intl = useIntl();

    const { state } = useKdaState();
    const columns = useMemo(() => {
        const columnWidth = [
            200,
            200,
            width - 400 - (state.items.length > 6 ? UiAsyncTableScrollbarWidth : 0),
        ];
        return [
            titleColumn(intl, columnWidth[0]),
            driverColumn(intl, columnWidth[1]),
            driversCountColumn(intl, columnWidth[2]),
        ] as UiAsyncTableColumn<KdaItem>[];
    }, [intl, width, state.items.length]);

    return (
        <div className={cx("gd-kda-key-drivers-summary")}>
            <div className={cx("gd-kda-key-drivers-summary-info")}>
                <div className={cx("gd-kda-key-drivers-summary-info-text")}>
                    {intl.formatMessage(
                        { id: "kdaDialog.dialog.keyDrives.overview.summary.drivers.description" },
                        {
                            combinations: state.combinations,
                            drivers: state.items.length,
                        },
                    )}
                </div>
                <UiButton
                    size="medium"
                    variant="secondary"
                    iconBefore="pencil"
                    label={intl.formatMessage({
                        id: "kdaDialog.dialog.keyDrives.overview.summary.drivers.edit_button",
                    })}
                />
            </div>
            <div className={cx("gd-kda-key-drivers-summary-list")} ref={ref as RefObject<HTMLDivElement>}>
                <UiAsyncTable
                    items={state.items.map((item) => item.data)}
                    totalItemsCount={state.items.length}
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
