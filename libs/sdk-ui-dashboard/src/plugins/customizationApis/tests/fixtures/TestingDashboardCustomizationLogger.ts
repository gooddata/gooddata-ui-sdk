// (C) 2022 GoodData Corporation
import { IDashboardPluginContract_V1 } from "../../../plugin.js";
import { IDashboardCustomizationLogger } from "../../customizationLogging.js";

export class TestingDashboardCustomizationLogger implements IDashboardCustomizationLogger {
    private readonly setCurrentPluginImpl: IDashboardCustomizationLogger["setCurrentPlugin"] | undefined;
    private readonly logImpl: IDashboardCustomizationLogger["log"] | undefined;
    private readonly warnImpl: IDashboardCustomizationLogger["warn"] | undefined;
    private readonly errorImpl: IDashboardCustomizationLogger["error"] | undefined;

    constructor(functions: Partial<IDashboardCustomizationLogger>) {
        this.setCurrentPluginImpl = functions.setCurrentPlugin;
        this.logImpl = functions.log;
        this.warnImpl = functions.warn;
        this.errorImpl = functions.error;
    }

    setCurrentPlugin(plugin: IDashboardPluginContract_V1 | undefined): void {
        this.setCurrentPluginImpl?.(plugin);
    }
    log(message: string, ...optionalParams: any[]): void {
        this.logImpl?.(message, optionalParams);
    }
    warn(message: string, ...optionalParams: any[]): void {
        this.warnImpl?.(message, optionalParams);
    }
    error(message: string, ...optionalParams: any[]): void {
        this.errorImpl?.(message, optionalParams);
    }
}
