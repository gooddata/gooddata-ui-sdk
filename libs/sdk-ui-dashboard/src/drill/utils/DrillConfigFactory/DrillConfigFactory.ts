// (C) 2019-2021 GoodData Corporation
import { isDrillToInsight, isDrillToDashboard } from "@gooddata/sdk-backend-spi";

import { DashboardDrillDefinition, isDrillToUrl } from "../../interfaces";

import { DrillToVisualizationItem } from "./DrillToVisualizationItem";
import { DrillToDashboardItem } from "./DrillToDashboardItem";
import { DrillToUrlItem } from "./DrillToUrlItem";
import { DrillDownItem } from "./DrillDownItem";
import { isDrillDownDefinition } from "@gooddata/sdk-ui-ext";

export class DrillConfigFactory {
    public static Create(drillData: DashboardDrillDefinition): any {
        if (isDrillToInsight(drillData)) {
            return new DrillToVisualizationItem(drillData);
        }

        if (isDrillToDashboard(drillData)) {
            return new DrillToDashboardItem(drillData);
        }

        if (isDrillToUrl(drillData)) {
            return new DrillToUrlItem(drillData);
        }

        if (isDrillDownDefinition(drillData)) {
            return new DrillDownItem(drillData);
        }
    }
}
