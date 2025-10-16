// (C) 2025 GoodData Corporation

import { IntlShape } from "react-intl";

import { UiAsyncTableColumn, UiButton } from "@gooddata/sdk-ui-kit";

import { KdaItem, KdaItemGroup } from "../../internalTypes.js";

export const driverColumn: (
    intl: IntlShape,
    width: number,
    onSelect: (item: KdaItem) => void,
) => UiAsyncTableColumn<KdaItemGroup> = (intl, width, onSelect) => {
    return {
        label: intl.formatMessage({ id: "kdaDialog.dialog.keyDrives.overview.detail.table.driver" }),
        key: "items",
        width,
        align: "left",
        getTextContent: (item) => {
            const first = item.items.sort((a, b) => {
                const aValue = Math.abs(a.to.value - a.from.value);
                const bValue = Math.abs(b.to.value - b.from.value);
                return bValue - aValue;
            })[0];

            if (item.items.length === 0) {
                return "-";
            }
            return (
                <UiButton
                    label={first.category}
                    variant="tertiary"
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onSelect(first);
                    }}
                />
            );
        },
    };
};
