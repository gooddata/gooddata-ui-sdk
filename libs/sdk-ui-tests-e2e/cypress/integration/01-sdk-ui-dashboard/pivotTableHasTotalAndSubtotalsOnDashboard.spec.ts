// (C) 2023-2026 GoodData Corporation

import { visit } from "../../tools/navigation";
import { Widget } from "../../tools/widget";

describe(
    "Pivot Table with multi format metrics",
    {
        tags: [
            "checklist_integrated_tiger_be",
            "checklist_integrated_tiger_fe",
            "checklist_integrated_tiger_releng_be",
            "checklist_integrated_tiger_releng_fe",
        ],
    },
    () => {
        it("should render insight with multi format metrics correctly", () => {
            visit("dashboard/dashboard-pivot-table-scenario");
            const table = new Widget(0, 1).waitTableLoaded().getTableNew();
            table.waitLoaded();
            table.hasCellValue(6, 1, "Closed Won");
            table.hasCellValue(6, 2, "██████████");
            table.hasCellValue(6, 3, "406");
            table.hasCellValue(7, 3, "–");
            table.hasCellValue(6, 4, "▼ 423,451,258.0%");
            table.hasCellValue(6, 5, "$406.00");
            //table.hasCellValue(6, 6, "<button>1.00</button>");
            table.hasCellValue(
                6,
                7,
                "100.0% long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long",
            );
            //table.hasCellValue(6, 8, "406.00 kiểm tra nghiêm khắc");
            table.scrollTo("center");
            //table.hasCellValue(6, 33, " 8,675,554.99");
            //table.hasCellValue(7, 33, "null value");
        });
    },
);
