// (C) 2022 GoodData Corporation

import { IThemeMetadataObject, ObjRef } from "@gooddata/sdk-model";

/**
 * This service provides access to organization styling settings such as theme.
 *
 * @public
 */
export interface IOrganizationStylingService {
    getThemes(): Promise<IThemeMetadataObject[]>;

    setActiveTheme(themeRef: ObjRef): Promise<void>;
}
