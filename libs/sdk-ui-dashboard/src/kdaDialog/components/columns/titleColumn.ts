// (C) 2025-2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import { type IUiAsyncTableColumn } from "@gooddata/sdk-ui-kit";

import { type KdaItemGroup } from "../../internalTypes.js";

export const titleColumn: (intl: IntlShape, width: number) => IUiAsyncTableColumn<KdaItemGroup> = (
    intl,
    width,
) => {
    return {
        label: intl.formatMessage({ id: "kdaDialog.dialog.keyDrives.overview.detail.table.attribute" }),
        key: "title",
        bold: true,
        width,
        align: "left",
    };
};
