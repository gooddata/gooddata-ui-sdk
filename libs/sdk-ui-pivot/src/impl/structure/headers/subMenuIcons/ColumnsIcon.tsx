// (C) 2023-2025 GoodData Corporation

import { Icon } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

export function ColumnsHeaderIcon() {
    const theme = useTheme();

    const ColumnsIcon = Icon["Columns"];

    return (
        <div className="gd-aggregation-submenu-header-icon">
            <ColumnsIcon
                width={12}
                height={11}
                colorPalette={{
                    normalColumn: theme?.palette?.complementary?.c7,
                    totalColumn: theme?.palette?.complementary?.c4,
                }}
            />
        </div>
    );
}
