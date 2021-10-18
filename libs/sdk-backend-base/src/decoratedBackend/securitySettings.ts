// (C) 2021 GoodData Corporation

import { ISecuritySettingsService, ValidationContext } from "@gooddata/sdk-backend-spi";

/**
 * @alpha
 */
export abstract class DecoratedSecuritySettingsService implements ISecuritySettingsService {
    public scope: string;

    protected constructor(private decorated: ISecuritySettingsService) {
        this.scope = this.decorated.scope;
    }

    public isUrlValid(url: string, context: ValidationContext): Promise<boolean> {
        return this.decorated.isUrlValid(url, context);
    }

    public isDashboardPluginUrlValid(url: string, workspace: string): Promise<boolean> {
        return this.decorated.isDashboardPluginUrlValid(url, workspace);
    }
}
