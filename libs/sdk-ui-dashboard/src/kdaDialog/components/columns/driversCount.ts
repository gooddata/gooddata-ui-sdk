// (C) 2025 GoodData Corporation

import { type IntlShape } from "react-intl";

import { type UiAsyncTableColumn } from "@gooddata/sdk-ui-kit";

import { type KdaItemGroup } from "../../internalTypes.js";

export const driversCountColumn: (intl: IntlShape, width: number) => UiAsyncTableColumn<KdaItemGroup> = (
    intl,
    width,
) => {
    return {
        label: intl.formatMessage({ id: "kdaDialog.dialog.keyDrives.overview.detail.table.drivers" }),
        key: "significantDrivers",
        align: "right",
        width,
        getTextContent: (item) => {
            return item.significantDrivers.length;
        },
    };
};
