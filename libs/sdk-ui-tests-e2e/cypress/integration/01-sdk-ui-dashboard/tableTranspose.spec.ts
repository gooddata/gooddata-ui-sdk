// (C) 2023-2025 GoodData Corporation

import * as Navigation from "../../tools/navigation";
import { Widget } from "../../tools/widget";

describe(
    "Dashboard with Table Transpose",
    { tags: ["checklist_integrated_tiger", "checklist_integrated_tiger_releng"] },
    () => {
        it.skip("rendering", () => {
            Navigation.visit("dashboard/dashboard-table-transpose");
            const table = new Widget(0).getTable();
            table.waitLoaded().hasCellValue(0, 0, "Forecast Category").hasMetricHeaderInRow(1, 0, "Amount");
        });
    },
);
