// (C) 2019-2026 GoodData Corporation

import { type AxiosPromise, type AxiosResponse } from "axios";
import { v4 as uuidv4 } from "uuid";

import {
    type ITigerClientBase,
    type JsonApiWorkspaceColorPaletteOutDocument,
    type JsonApiWorkspaceThemeOutDocument,
    MetadataUtilities,
} from "@gooddata/api-client-tiger";
import {
    EntitiesApi_CreateEntityWorkspaceColorPalettes,
    EntitiesApi_CreateEntityWorkspaceThemes,
    EntitiesApi_DeleteEntityWorkspaceColorPalettes,
    EntitiesApi_DeleteEntityWorkspaceThemes,
    EntitiesApi_GetAllEntitiesColorPalettes,
    EntitiesApi_GetAllEntitiesThemes,
    EntitiesApi_GetAllEntitiesWorkspaceColorPalettes,
    EntitiesApi_GetAllEntitiesWorkspaceThemes,
    EntitiesApi_UpdateEntityWorkspaceColorPalettes,
    EntitiesApi_UpdateEntityWorkspaceThemes,
} from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import { type IWorkspaceStylingService } from "@gooddata/sdk-backend-spi";
import {
    type IColorPaletteDefinition,
    type IColorPaletteItem,
    type IColorPaletteMetadataObject,
    type ITheme,
    type IThemeDefinition,
    type IThemeMetadataObject,
    type ObjRef,
    idRef,
} from "@gooddata/sdk-model";

import {
    convertColorPalette as convertColorPaletteFromBackend,
    convertColorPaletteWithLinks,
    getColorPaletteFromMDObject,
    isValidColorPalette,
    unwrapColorPaletteContent,
} from "../../../convertors/fromBackend/ColorPaletteConverter.js";
import {
    convertTheme as convertThemeFromBackend,
    convertThemeWithLinks,
} from "../../../convertors/fromBackend/ThemeConverter.js";
import { convertWorkspaceColorPalette as convertWorkspaceColorPaletteToBackend } from "../../../convertors/toBackend/ColorPaletteConverter.js";
import { convertWorkspaceTheme as convertWorkspaceThemeToBackend } from "../../../convertors/toBackend/ThemeConverter.js";
import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { objRefToIdentifier } from "../../../utils/api.js";
import { TigerWorkspaceSettings, getSettingsForCurrentUser } from "../settings/index.js";

import { DefaultColorPalette } from "./mocks/colorPalette.js";
import { DefaultTheme } from "./mocks/theme.js";

/**
 * Shape of the resolved `activeTheme` / `activeColorPalette` setting content. The `type` discriminator selects
 * the scope the `id` must be resolved against; it is mandatory on the backend and MUST be honored - a
 * workspace-scoped id must never silently fall back to an org object that happens to share the id.
 */
interface IActiveStyleSetting {
    id?: string;
    type?: "theme" | "workspaceTheme" | "colorPalette" | "workspaceColorPalette";
}

export class TigerWorkspaceStyling implements IWorkspaceStylingService {
    private settingsService: TigerWorkspaceSettings;

    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        public readonly workspace: string,
    ) {
        this.settingsService = new TigerWorkspaceSettings(authCall, workspace);
    }

    /**
     * Checks if Theming needs to be loaded.
     * activeTheme needs to be defined
     *
     * @returns boolean
     */
    private isStylizable(activeStyleId: string): boolean {
        return activeStyleId !== "";
    }

    /**
     * Resolve the active styling object's content by fetching a filtered single-object list and unwrapping
     * the first hit. A missing object (or a failed fetch) yields the provided fallback rather than throwing,
     * so styling problems never break the application. The caller selects the scope-specific endpoint, so
     * there is no cross-scope fallback here.
     */
    private resolveActiveStyleContent = <T>(
        fetchList: (
            client: ITigerClientBase,
        ) => AxiosPromise<{ data: Array<{ attributes: { content: object } }> }>,
        unwrapContent: (content: object) => T,
        fallback: T,
    ): Promise<T> =>
        this.authCall((client) =>
            fetchList(client)
                .then((response) =>
                    response.data.data.length === 0
                        ? fallback
                        : unwrapContent(response.data.data[0].attributes.content),
                )
                // Failed styling loading should not break the application
                .catch(() => fallback),
        );

    public getColorPalette = async (): Promise<IColorPaletteItem[]> => {
        const userSettings = await getSettingsForCurrentUser(this.authCall, this.workspace);
        const activeColorPalette = userSettings["activeColorPalette"] as IActiveStyleSetting | undefined;
        const activeColorPaletteId = activeColorPalette?.id ?? "";

        if (!this.isStylizable(activeColorPaletteId)) {
            return DefaultColorPalette;
        }

        const filter = `id=="${activeColorPaletteId}"`;
        // Resolve the id against the scope declared by the setting; no cross-scope fallback.
        const fetchList: (client: ITigerClientBase) => AxiosPromise<any> =
            activeColorPalette?.type === "workspaceColorPalette"
                ? (client) =>
                      EntitiesApi_GetAllEntitiesWorkspaceColorPalettes(client.axios, client.basePath, {
                          workspaceId: this.workspace,
                          filter,
                      })
                : (client) =>
                      EntitiesApi_GetAllEntitiesColorPalettes(client.axios, client.basePath, { filter });

        // Validate the resolved content the same way the listing path does, so malformed backend content
        // falls back to the default rather than flowing through unchecked.
        return this.resolveActiveStyleContent(
            fetchList,
            (content) => {
                const colorPalette = unwrapColorPaletteContent(content);
                return isValidColorPalette(colorPalette) ? colorPalette : DefaultColorPalette;
            },
            DefaultColorPalette,
        );
    };

    public getTheme = async (): Promise<ITheme> => {
        const userSettings = await getSettingsForCurrentUser(this.authCall, this.workspace);
        const activeTheme = userSettings["activeTheme"] as IActiveStyleSetting | undefined;
        const activeThemeId = activeTheme?.id ?? "";

        if (!this.isStylizable(activeThemeId)) {
            return DefaultTheme;
        }

        const filter = `id=="${activeThemeId}"`;
        // Resolve the id against the scope declared by the setting; no cross-scope fallback.
        const fetchList: (client: ITigerClientBase) => AxiosPromise<any> =
            activeTheme?.type === "workspaceTheme"
                ? (client) =>
                      EntitiesApi_GetAllEntitiesWorkspaceThemes(client.axios, client.basePath, {
                          workspaceId: this.workspace,
                          filter,
                      })
                : (client) => EntitiesApi_GetAllEntitiesThemes(client.axios, client.basePath, { filter });

        return this.resolveActiveStyleContent(fetchList, (content) => content as ITheme, DefaultTheme);
    };

    private async getActiveSetting(setting: string): Promise<ObjRef | undefined> {
        const settings = await this.settingsService.getSettings();
        const foundSetting = settings?.[setting] as IActiveStyleSetting | undefined;
        // Preserve the scope discriminator on the returned reference so it round-trips back through
        // setActiveTheme / setActiveColorPalette without losing which collection it points at.
        return foundSetting?.id ? idRef(foundSetting.id, foundSetting.type) : undefined;
    }

    public getActiveTheme = () => this.getActiveSetting("activeTheme");

    public async setActiveTheme(themeRef: ObjRef): Promise<void> {
        // The scope is carried by the reference type; the settings service maps it to the setting discriminator.
        await this.settingsService.setTheme(themeRef);
    }

    public getActiveColorPalette = () => this.getActiveSetting("activeColorPalette");

    public async setActiveColorPalette(colorPaletteRef: ObjRef): Promise<void> {
        await this.settingsService.setColorPalette(colorPaletteRef);
    }

    public async clearActiveTheme(): Promise<void> {
        await this.settingsService.deleteTheme();
    }

    public async clearActiveColorPalette(): Promise<void> {
        await this.settingsService.deleteColorPalette();
    }

    /**
     * Request all themes defined on the workspace level.
     *
     * @returns promise of array of theme metadata objects
     */
    public async getThemes(): Promise<IThemeMetadataObject[]> {
        return await this.authCall((client) =>
            MetadataUtilities.getAllPagesOf(client, EntitiesApi_GetAllEntitiesWorkspaceThemes, {
                workspaceId: this.workspace,
                // Only the workspace's own themes are manageable here; update/delete target this workspace's
                // path, so inherited parent themes (origin ALL/PARENTS) must be excluded from the listing.
                origin: "NATIVE",
                sort: ["name"],
            })
                .then(MetadataUtilities.mergeEntitiesResults)
                .then((themes) => themes.data.map(convertThemeWithLinks)),
        );
    }

    /**
     * Create a new theme on the workspace level.
     *
     * @param theme - theme definition; a random id is generated when none is provided
     * @returns promise of the created theme metadata object
     */
    public async createTheme(theme: IThemeDefinition): Promise<IThemeMetadataObject> {
        return await this.authCall((client) =>
            EntitiesApi_CreateEntityWorkspaceThemes(client.axios, client.basePath, {
                workspaceId: this.workspace,
                jsonApiWorkspaceThemeInDocument: {
                    data: convertWorkspaceThemeToBackend(theme.id || uuidv4(), theme),
                },
            }).then(this.parseThemeResult),
        );
    }

    /**
     * Update an existing theme on the workspace level. Falls back to {@link createTheme} when the definition
     * carries no reference yet.
     *
     * @param theme - theme definition
     * @returns promise of the updated theme metadata object
     */
    public async updateTheme(theme: IThemeDefinition): Promise<IThemeMetadataObject> {
        if (!theme.ref) {
            return this.createTheme(theme);
        }
        const id = objRefToIdentifier(theme.ref, this.authCall);
        return await this.authCall((client) =>
            EntitiesApi_UpdateEntityWorkspaceThemes(client.axios, client.basePath, {
                workspaceId: this.workspace,
                objectId: id,
                jsonApiWorkspaceThemeInDocument: {
                    data: convertWorkspaceThemeToBackend(id, theme),
                },
            }).then(this.parseThemeResult),
        );
    }

    private parseThemeResult(result: AxiosResponse<JsonApiWorkspaceThemeOutDocument>): IThemeMetadataObject {
        return convertThemeFromBackend(result.data);
    }

    /**
     * Delete a theme on the workspace level.
     *
     * @param themeRef - theme reference
     * @returns promise
     */
    public async deleteTheme(themeRef: ObjRef): Promise<void> {
        const id = objRefToIdentifier(themeRef, this.authCall);
        await this.authCall((client) =>
            EntitiesApi_DeleteEntityWorkspaceThemes(client.axios, client.basePath, {
                workspaceId: this.workspace,
                objectId: id,
            }),
        );
    }

    /**
     * Request all color palettes defined on the workspace level. Palettes with invalid content are filtered out.
     *
     * @returns promise of array of color palette metadata objects
     */
    public async getColorPalettes(): Promise<IColorPaletteMetadataObject[]> {
        return await this.authCall((client) =>
            MetadataUtilities.getAllPagesOf(client, EntitiesApi_GetAllEntitiesWorkspaceColorPalettes, {
                workspaceId: this.workspace,
                // Only the workspace's own palettes are manageable here; exclude inherited parent palettes.
                origin: "NATIVE",
                sort: ["name"],
            })
                .then(MetadataUtilities.mergeEntitiesResults)
                .then((colorPalettes) => {
                    return colorPalettes.data
                        .filter((colorPaletteData) =>
                            isValidColorPalette(getColorPaletteFromMDObject(colorPaletteData)),
                        )
                        .map(convertColorPaletteWithLinks);
                }),
        );
    }

    /**
     * Create a new color palette on the workspace level.
     *
     * @param colorPalette - color palette definition; a random id is generated when none is provided
     * @returns promise of the created color palette metadata object
     * @throws Error when the color palette content is not a valid palette
     */
    public async createColorPalette(
        colorPalette: IColorPaletteDefinition,
    ): Promise<IColorPaletteMetadataObject> {
        if (isValidColorPalette(colorPalette.colorPalette)) {
            return await this.authCall((client) =>
                EntitiesApi_CreateEntityWorkspaceColorPalettes(client.axios, client.basePath, {
                    workspaceId: this.workspace,
                    jsonApiWorkspaceColorPaletteInDocument: {
                        data: convertWorkspaceColorPaletteToBackend(
                            colorPalette.id || uuidv4(),
                            colorPalette,
                        ),
                    },
                }).then(this.parseColorPaletteResult),
            );
        }
        throw new Error("Invalid color palette format");
    }

    /**
     * Update an existing color palette on the workspace level. Falls back to {@link createColorPalette} when
     * the definition carries no reference yet.
     *
     * @param colorPalette - color palette definition
     * @returns promise of the updated color palette metadata object
     * @throws Error when the color palette content is not a valid palette
     */
    public async updateColorPalette(
        colorPalette: IColorPaletteDefinition,
    ): Promise<IColorPaletteMetadataObject> {
        if (!colorPalette.ref) {
            return this.createColorPalette(colorPalette);
        }
        if (isValidColorPalette(colorPalette.colorPalette)) {
            const id = objRefToIdentifier(colorPalette.ref, this.authCall);
            return await this.authCall((client) =>
                EntitiesApi_UpdateEntityWorkspaceColorPalettes(client.axios, client.basePath, {
                    workspaceId: this.workspace,
                    objectId: id,
                    jsonApiWorkspaceColorPaletteInDocument: {
                        data: convertWorkspaceColorPaletteToBackend(id, colorPalette),
                    },
                }).then(this.parseColorPaletteResult),
            );
        }
        throw new Error("Invalid color palette format");
    }

    /**
     * Delete a color palette on the workspace level.
     *
     * @param colorPaletteRef - color palette reference
     * @returns promise
     */
    public async deleteColorPalette(colorPaletteRef: ObjRef): Promise<void> {
        const id = objRefToIdentifier(colorPaletteRef, this.authCall);
        await this.authCall((client) =>
            EntitiesApi_DeleteEntityWorkspaceColorPalettes(client.axios, client.basePath, {
                workspaceId: this.workspace,
                objectId: id,
            }),
        );
    }

    private parseColorPaletteResult(
        result: AxiosResponse<JsonApiWorkspaceColorPaletteOutDocument>,
    ): IColorPaletteMetadataObject {
        return convertColorPaletteFromBackend(result.data);
    }
}
