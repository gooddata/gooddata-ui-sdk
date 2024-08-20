// (C) 2021-2022 GoodData Corporation
import {
    IUserWorkspaceSettings,
    IWorkspaceSettings,
    IWorkspaceSettingsService,
} from "@gooddata/sdk-backend-spi";

/**
 * @alpha
 */
export abstract class DecoratedWorkspaceSettingsService implements IWorkspaceSettingsService {
    protected constructor(protected decorated: IWorkspaceSettingsService) {}

    async getSettings(): Promise<IWorkspaceSettings> {
        return this.decorated.getSettings();
    }

    async getSettingsForCurrentUser(): Promise<IUserWorkspaceSettings> {
        return this.decorated.getSettingsForCurrentUser();
    }

    async setLocale(locale: string): Promise<void> {
        return this.decorated.setLocale(locale);
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
