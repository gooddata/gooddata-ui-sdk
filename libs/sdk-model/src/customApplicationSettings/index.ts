// (C) 2026 GoodData Corporation

/**
 * Setting that an application stores in a workspace.
 *
 * @alpha
 */
export interface ICustomApplicationSetting {
    id: string;
    /**
     * Name of the application that owns the setting.
     */
    applicationName: string;
    /**
     * Content of the setting. The application defines its structure.
     */
    content: { [key: string]: unknown };
}
