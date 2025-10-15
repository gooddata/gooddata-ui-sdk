// (C) 2023-2025 GoodData Corporation

import { DashboardMenu, ExportMenu } from "../../tools/dashboardMenu";
import { TopBar } from "../../tools/dashboards";
import { Export } from "../../tools/export";
import { AttributeFilter } from "../../tools/filterBar";
import * as Navigation from "../../tools/navigation";
import { Widget } from "../../tools/widget";

const dashboardMenu = new DashboardMenu();
const productFilter = new AttributeFilter("Product");
const exportControl = new Export();
const widget = new Widget(0);
const topBar = new TopBar();

describe(
    "Export dashboard to PDF",
    { tags: ["checklist_integrated_tiger_export", "checklist_integrated_tiger_export_releng"] },
    () => {
        it("should be able to export dashboard with temporary filter to PDF", () => {
            Navigation.visit("dashboard/nullvalue");
            topBar.dashboardTitleExist().dashboardTitleHasValue("KD has null value");
            productFilter.open().selectAttributeWithoutSearch("PhoenixSoft");
            widget.waitTableLoaded();

            dashboardMenu.toggle().clickExport().clickExportOption(ExportMenu.EXPORT_SNAPSHOT);
            exportControl.expectExportedPDF(
                "KD has null value.pdf",
                "Region\n(empty value)\nProductMetric has null value_Snapshot [EOP]_Timeline [EOP]\nPhoenixSoft1,45941,054.0044,195\nAD has null value\nKD has null value",
            );
        });
    },
);
