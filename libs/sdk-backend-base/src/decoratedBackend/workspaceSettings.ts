// (C) 2021-2025 GoodData Corporation
import {
    IUserWorkspaceSettings,
    IWorkspaceSettings,
    IWorkspaceSettingsService,
} from "@gooddata/sdk-backend-spi";
import { IAlertDefault, ISeparators, type DashboardFiltersApplyMode } from "@gooddata/sdk-model";

/**
 * @alpha
 */
export abstract class DecoratedWorkspaceSettingsService implements IWorkspaceSettingsService {
    protected constructor(protected decorated: IWorkspaceSettingsService) {}

    async setAlertDefault(value: IAlertDefault): Promise<void> {
        return this.decorated.setAlertDefault(value);
    }

    async getSettings(): Promise<IWorkspaceSettings> {
        return this.decorated.getSettings();
    }

    async getSettingsForCurrentUser(): Promise<IUserWorkspaceSettings> {
        return this.decorated.getSettingsForCurrentUser();
    }

    async setLocale(locale: string): Promise<void> {
        return this.decorated.setLocale(locale);
    }

    async setMetadataLocale(locale: string): Promise<void> {
        return this.decorated.setMetadataLocale(locale);
    }

    async setSeparators(separators: ISeparators): Promise<void> {
        return this.decorated.setSeparators(separators);
    }

    async setActiveLlmEndpoint(endpoint: string): Promise<void> {
        return this.decorated.setActiveLlmEndpoint(endpoint);
    }

    async setTimezone(timezone: string): Promise<void> {
        return this.decorated.setTimezone(timezone);
    }

    async setDateFormat(dateFormat: string): Promise<void> {
        return this.decorated.setDateFormat(dateFormat);
    }

    async setWeekStart(weekStart: string): Promise<void> {
        return this.decorated.setWeekStart(weekStart);
    }

    async setDashboardFiltersApplyMode(dashboardFiltersApplyMode: DashboardFiltersApplyMode): Promise<void> {
        return this.decorated.setDashboardFiltersApplyMode(dashboardFiltersApplyMode);
    }

    async deleteDashboardFiltersApplyMode(): Promise<void> {
        return this.decorated.deleteDashboardFiltersApplyMode();
    }

    async setTheme(themeId: string): Promise<void> {
        return this.decorated.setTheme(themeId);
    }

    async deleteTheme(): Promise<void> {
        return this.decorated.deleteTheme();
    }

    async deleteColorPalette(): Promise<void> {
        return this.decorated.deleteColorPalette();
    }

    async setColorPalette(colorPaletteId: string): Promise<void> {
        return this.decorated.setColorPalette(colorPaletteId);
    }
}
