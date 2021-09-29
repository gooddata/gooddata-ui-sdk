// (C) 2021 GoodData Corporation

import { IDashboardCustomizer, IDashboardInsightCustomizer } from "../customizer";
import { IDashboardExtensionProps } from "../../presentation";
import { DefaultInsightCustomizer } from "./insightCustomizer";
import { DashboardCustomizationLogger } from "./customizationLogging";
import { IDashboardPlugin } from "../plugin";

/**
 * @internal
 */
export class DashboardCustomizationBuilder implements IDashboardCustomizer {
    private readonly logger: DashboardCustomizationLogger = new DashboardCustomizationLogger();
    private readonly insightCustomizer: DefaultInsightCustomizer = new DefaultInsightCustomizer(this.logger);

    private sealCustomizers = (): void => {
        this.insightCustomizer.sealCustomizer();
    };

    public insightRendering = (): IDashboardInsightCustomizer => {
        return this.insightCustomizer;
    };

    public onBeforePluginRegister = (plugin: IDashboardPlugin): void => {
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
        };

        this.sealCustomizers();

        return props;
    };
}
