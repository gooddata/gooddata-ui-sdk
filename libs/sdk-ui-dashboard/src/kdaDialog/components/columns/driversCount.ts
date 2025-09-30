// (C) 2025 GoodData Corporation

import { IntlShape } from "react-intl";

import { UiAsyncTableColumn } from "@gooddata/sdk-ui-kit";

import { KdaItem } from "../../internalTypes.js";

export const driversCountColumn: (intl: IntlShape, width: number) => UiAsyncTableColumn<KdaItem> = (
    intl,
    width,
) => {
    return {
        label: intl.formatMessage({ id: "kdaDialog.dialog.keyDrives.overview.detail.table.drivers" }),
        key: "drivers",
        align: "right",
        width,
    };
};
