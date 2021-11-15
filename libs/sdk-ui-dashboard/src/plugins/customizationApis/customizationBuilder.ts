// (C) 2021 GoodData Corporation

import {
    IDashboardCustomizer,
    IDashboardInsightCustomizer,
    IDashboardKpiCustomizer,
    IDashboardLayoutCustomizer,
    IDashboardWidgetCustomizer,
} from "../customizer";
import { IDashboardExtensionProps } from "../../presentation";
import { DefaultInsightCustomizer } from "./insightCustomizer";
import { DashboardCustomizationLogger } from "./customizationLogging";
import { IDashboardPluginContract_V1 } from "../plugin";
import { DefaultKpiCustomizer } from "./kpiCustomizer";
import { DefaultWidgetCustomizer } from "./widgetCustomizer";
import { DefaultLayoutCustomizer } from "./layoutCustomizer";

/**
 * @internal
 */
export class DashboardCustomizationBuilder implements IDashboardCustomizer {
    private readonly logger: DashboardCustomizationLogger = new DashboardCustomizationLogger();
    private readonly insightCustomizer: DefaultInsightCustomizer = new DefaultInsightCustomizer(this.logger);
    private readonly kpiCustomizer: DefaultKpiCustomizer = new DefaultKpiCustomizer(this.logger);
    private readonly widgetCustomizer: DefaultWidgetCustomizer = new DefaultWidgetCustomizer(this.logger);
    private readonly layoutCustomizer: DefaultLayoutCustomizer = new DefaultLayoutCustomizer(this.logger);

    private sealCustomizers = (): void => {
        this.insightCustomizer.sealCustomizer();
        this.kpiCustomizer.sealCustomizer();
        this.widgetCustomizer.sealCustomizer();
        this.layoutCustomizer.sealCustomizer();
    };

    public insightWidgets = (): IDashboardInsightCustomizer => {
        return this.insightCustomizer;
    };

    public kpiWidgets = (): IDashboardKpiCustomizer => {
        return this.kpiCustomizer;
    };

    public customWidgets = (): IDashboardWidgetCustomizer => {
        return this.widgetCustomizer;
    };

    public layout = (): IDashboardLayoutCustomizer => {
        return this.layoutCustomizer;
    };

    public onBeforePluginRegister = (plugin: IDashboardPluginContract_V1): void => {
        this.logger.setCurrentPlugin(plugin);
        this.logger.log("Starting registration.");
    };

    public onAfterPluginRegister = (): void => {
        this.logger.log("Registration finished.");
        this.logger.setCurrentPlugin(undefined);
    };

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public onPluginRegisterError = (error: any): void => {
        this.logger.error(
            "Plugin register() method threw and exception. Plugin may be partially registered.",
            error,
        );
        this.logger.setCurrentPlugin(undefined);
    };

    public build = (): IDashboardExtensionProps => {
        const props: IDashboardExtensionProps = {
            InsightComponentProvider: this.insightCustomizer.getInsightProvider(),
            KpiComponentProvider: this.kpiCustomizer.getKpiProvider(),
            WidgetComponentProvider: this.widgetCustomizer.getWidgetComponentProvider(),
            customizationFns: {
                existingDashboardTransformFn: this.layoutCustomizer.getExistingDashboardTransformFn(),
            },
        };

        this.sealCustomizers();

        return props;
    };
}
