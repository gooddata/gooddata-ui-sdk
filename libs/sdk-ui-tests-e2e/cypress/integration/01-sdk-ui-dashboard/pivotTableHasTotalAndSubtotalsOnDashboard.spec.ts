// (C) 2023 GoodData Corporation
import * as Navigation from "../../tools/navigation";
import { Export } from "../../tools/export";
import { TopBar } from "../../tools/dashboards";
import { Widget } from "../../tools/widget";

const widget = new Widget(0);
const topBar = new TopBar();
const exportControl = new Export();

describe("Export dashboard", { tags: ["checklist_integrated_tiger"] }, () => {
    beforeEach(() => {
        Navigation.visit("dashboard/dashboard-pivot-table-scenario");
        widget.waitTableLoaded();
    });

    it("should export insight to CSV from dashboards", () => {
        topBar.dashboardTitleExist().dashboardTitleHasValue("Pivot Table Dashboard");
        exportControl.exportInsightOnWidgetByIndexToCSV(0);
        exportControl.expectExportedCSV(
            "Table has AM metric.csv",
            "WonderKid,89,41055,41144,60,41055,41115,188,41055,41243,123165,123502,68,41055,41123,32,41055,41087,84,41055,41139,123165,123349,246330,246851\n",
        );
    });

    // This test is blocked by ticket NAS-5157
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip("should export insight to XLSX from dashboards", () => {
        exportControl.exportInsightOnWidgetByIndexToXLSX(0);
        exportControl.expectExportedXLSX("dashboardInfo.fileName", 1, "");
    });
});

describe("Pivot Table with multi format metrics", { tags: ["checklist_integrated_tiger"] }, () => {
    it("should render insight with multi format metrics correctly", () => {
        Navigation.visit("dashboard/dashboard-pivot-table-scenario");
        const table = new Widget(1).waitTableLoaded().getTable();
        table.waitLoaded();
        table.hasCellValue(6, 1, "Closed Won");
        table.hasCellValue(6, 2, "██████████");
        table.hasCellValue(6, 3, "406");
        table.hasCellValue(7, 3, "–");
        table.hasCellValue(6, 4, "▼ 423,451,258.0%");
        table.hasCellValue(6, 5, "$406.00");
        table.hasCellValue(6, 6, "<button>1.00</button>");
        table.hasCellValue(
            6,
            7,
            "100.0% long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long",
        );
        table.hasCellValue(6, 8, "406.00 kiểm tra nghiêm khắc");
        table.scrollTo("center");
        table.hasCellValue(6, 33, " 8,675,554.99");
        table.hasCellValue(7, 33, "null value");
    });
});
