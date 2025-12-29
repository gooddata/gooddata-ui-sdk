// (C) 2023-2025 GoodData Corporation

import * as Navigation from "../../tools/navigation";
import { Widget } from "../../tools/widget";

describe(
    "Dashboard with Table Transpose",
    {
        tags: [
            "checklist_integrated_tiger_be",
            "checklist_integrated_tiger_fe",
            "checklist_integrated_tiger_releng_be",
            "checklist_integrated_tiger_releng_fe",
        ],
    },
    () => {
        it("rendering", () => {
            Navigation.visit("dashboard/dashboard-table-transpose");
            const table = new Widget(0).getTableNew();
            table.waitLoaded().hasCellValue(0, 1, "$48,932,639.59").hasMetricHeaderInRow(0, 0, "Amount");
        });
    },
);
