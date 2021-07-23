// (C) 2019-2021 GoodData Corporation
import { isDrillToInsight, isDrillToDashboard } from "@gooddata/sdk-backend-spi";

import { DashboardDrillDefinition, isDrillDownDefinition } from "../../../../types";
import { isDrillToUrl } from "../../types";

import { DrillToVisualizationItem } from "./DrillToVisualizationItem";
import { DrillToDashboardItem } from "./DrillToDashboardItem";
import { DrillToUrlItem } from "./DrillToUrlItem";
import { DrillDownItem } from "./DrillDownItem";

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
