// (C) 2023-2025 GoodData Corporation

import React from "react";

import { Icon } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

const { Rows: RowsIcon } = Icon;

export function RowsHeaderIcon() {
    const theme = useTheme();
    return (
        <div className="gd-aggregation-submenu-header-icon">
            <RowsIcon
                width={12}
                height={11}
                colorPalette={{
                    normalRow: theme?.palette?.complementary?.c7,
                    totalRow: theme?.palette?.complementary?.c4,
                }}
            />
        </div>
    );
}
