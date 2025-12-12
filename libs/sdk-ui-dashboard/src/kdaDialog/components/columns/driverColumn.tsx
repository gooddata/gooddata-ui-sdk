// (C) 2025 GoodData Corporation

import { type IntlShape } from "react-intl";

import { type UiAsyncTableColumn, UiButton } from "@gooddata/sdk-ui-kit";

import { type KdaItemGroup } from "../../internalTypes.js";
import { getSortedSignificantDriver } from "../../tools/sortedKeyDrivers.js";

export const driverColumn: (intl: IntlShape, width: number) => UiAsyncTableColumn<KdaItemGroup> = (
    intl,
    width,
) => {
    return {
        label: intl.formatMessage({ id: "kdaDialog.dialog.keyDrives.overview.detail.table.driver" }),
        key: "significantDrivers",
        width,
        align: "left",
        getTextContent: (item) => {
            if (item.significantDrivers.length === 0) {
                return "-";
            }
            const first = getSortedSignificantDriver(item)[0];
            return <UiButton tabIndex={-1} label={first.category} variant="tertiary" size="small" />;
        },
    };
};
