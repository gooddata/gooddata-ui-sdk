// (C) 2025 GoodData Corporation

import { IntlShape } from "react-intl";

import { UiAsyncTableColumn } from "@gooddata/sdk-ui-kit";

import { KdaItemGroup } from "../../internalTypes.js";

export const driversCountColumn: (intl: IntlShape, width: number) => UiAsyncTableColumn<KdaItemGroup> = (
    intl,
    width,
) => {
    return {
        label: intl.formatMessage({ id: "kdaDialog.dialog.keyDrives.overview.detail.table.drivers" }),
        key: "items",
        align: "right",
        width,
        getTextContent: (item) => {
            return item.items.length;
        },
    };
};
