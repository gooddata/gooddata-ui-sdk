// (C) 2023-2025 GoodData Corporation

import { IconColumns } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

export function ColumnsHeaderIcon() {
    const theme = useTheme();

    return (
        <div className="gd-aggregation-submenu-header-icon">
            <IconColumns
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
