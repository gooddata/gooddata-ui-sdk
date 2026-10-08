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
    type IColorPalette,
    type IColorPaletteDefinition,
    type IColorPaletteItem,
    type IColorPaletteMetadataObject,
    type ITheme,
    type IThemeDefinition,
    type IThemeMetadataObject,
    type ObjRef,
    idRef,
    isIdentifierRef,
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

interface IOriginAwareEntity {
    id: string;
    meta?: { origin?: { originType: "NATIVE" | "PARENT" } };
}

// A workspace and its parent may each own an object with the same id. The workspace's own one is
// the one its settings resolve to, and keeping both would give the list two identical references.
const preferNativeById = <T extends IOriginAwareEntity>(entities: T[]): T[] => {
    const byId = new Map<string, T>();
    for (const entity of entities) {
        const existing = byId.get(entity.id);
        if (!existing || entity.meta?.origin?.originType === "NATIVE") {
            byId.set(entity.id, entity);
        }
    }
    return entities.filter((entity) => byId.get(entity.id) === entity);
};

export class TigerWorkspaceStyling implements IWorkspaceStylingService {
    private settingsService: TigerWorkspaceSettings;

    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        public readonly workspace: string,
    ) {
        this.settingsService = new TigerWorkspaceSettings(authCall, workspace);
    }

    /**
     * Fetch the active styling object's content from a filtered single-object list and unwrap the first hit.
     * A missing object (or a failed fetch) yields `undefined` rather than throwing, so styling problems never
     * break the application. The caller selects the scope-specific endpoint, so there is no cross-scope
     * fallback here.
     */
    private fetchActiveStyleContent = <T>(
        fetchList: (
            client: ITigerClientBase,
        ) => AxiosPromise<{ data: Array<{ attributes: { content: object } }> }>,
        unwrapContent: (content: object) => T,
    ): Promise<T | undefined> =>
        this.authCall((client) =>
            fetchList(client)
                .then((response) =>
                    response.data.data.length === 0
                        ? undefined
                        : unwrapContent(response.data.data[0].attributes.content),
                )
                // Failed styling loading should not break the application
                .catch(() => undefined),
        );

    private resolveActiveStyleContent = async <T>(
        fetchList: (
            client: ITigerClientBase,
        ) => AxiosPromise<{ data: Array<{ attributes: { content: object } }> }>,
        unwrapContent: (content: object) => T,
        fallback: T,
    ): Promise<T> => (await this.fetchActiveStyleContent(fetchList, unwrapContent)) ?? fallback;

    /**
     * Resolve the active theme or color palette for the current user in this workspace. The resolved setting
     * may come from the user layer, which has no workspace: a reference this workspace cannot resolve falls
     * through to the setting resolved without the user layer, so it never masks the workspace's or the
     * organization's own one.
     */
    private async resolveActiveStyle<T>(
        key: "activeTheme" | "activeColorPalette",
        fetchListFor: (active: IActiveStyleSetting) => (client: ITigerClientBase) => AxiosPromise<any>,
        unwrapContent: (content: object) => T,
        fallback: T,
    ): Promise<T> {
        const userSettings = await getSettingsForCurrentUser(this.authCall, this.workspace);
        const active = userSettings[key] as IActiveStyleSetting | undefined;
        if (!active?.id) {
            return fallback;
        }
        const resolved = await this.fetchActiveStyleContent(fetchListFor(active), unwrapContent);
        if (resolved !== undefined) {
            return resolved;
        }
        const workspaceSettings = await this.settingsService.getSettings();
        const workspaceActive = workspaceSettings?.[key] as IActiveStyleSetting | undefined;
        if (
            !workspaceActive?.id ||
            (workspaceActive.id === active.id && workspaceActive.type === active.type)
        ) {
            return fallback;
        }
        return (await this.fetchActiveStyleContent(fetchListFor(workspaceActive), unwrapContent)) ?? fallback;
    }

    // Resolve the id against the scope declared by the setting; no cross-scope fallback.
    private colorPaletteFetcher =
        (active: IActiveStyleSetting) =>
        (client: ITigerClientBase): AxiosPromise<any> => {
            const filter = `id=="${active.id}"`;
            return active.type === "workspaceColorPalette"
                ? EntitiesApi_GetAllEntitiesWorkspaceColorPalettes(client.axios, client.basePath, {
                      workspaceId: this.workspace,
                      filter,
                  })
                : EntitiesApi_GetAllEntitiesColorPalettes(client.axios, client.basePath, { filter });
        };

    private themeFetcher =
        (active: IActiveStyleSetting) =>
        (client: ITigerClientBase): AxiosPromise<any> => {
            const filter = `id=="${active.id}"`;
            return active.type === "workspaceTheme"
                ? EntitiesApi_GetAllEntitiesWorkspaceThemes(client.axios, client.basePath, {
                      workspaceId: this.workspace,
                      filter,
                  })
                : EntitiesApi_GetAllEntitiesThemes(client.axios, client.basePath, { filter });
        };

    public getColorPalette = (): Promise<IColorPaletteItem[]> =>
        // Validate the resolved content the same way the listing path does, so malformed backend content
        // falls back to the default rather than flowing through unchecked.
        this.resolveActiveStyle(
            "activeColorPalette",
            this.colorPaletteFetcher,
            (content) => {
                const colorPalette = unwrapColorPaletteContent(content);
                return isValidColorPalette(colorPalette) ? colorPalette : DefaultColorPalette;
            },
            DefaultColorPalette,
        );

    public getTheme = (): Promise<ITheme> =>
        this.resolveActiveStyle(
            "activeTheme",
            this.themeFetcher,
            (content) => content as ITheme,
            DefaultTheme,
        );

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

    public async getAvailableThemes(): Promise<IThemeMetadataObject[]> {
        return await this.authCall((client) =>
            MetadataUtilities.getAllPagesOf(client, EntitiesApi_GetAllEntitiesWorkspaceThemes, {
                workspaceId: this.workspace,
                origin: "ALL",
                metaInclude: ["origin"],
                sort: ["name"],
            })
                .then(MetadataUtilities.mergeEntitiesResults)
                .then((themes) => preferNativeById(themes.data).map(convertThemeWithLinks)),
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

    public async getAvailableColorPalettes(): Promise<IColorPaletteMetadataObject[]> {
        return await this.authCall((client) =>
            MetadataUtilities.getAllPagesOf(client, EntitiesApi_GetAllEntitiesWorkspaceColorPalettes, {
                workspaceId: this.workspace,
                origin: "ALL",
                metaInclude: ["origin"],
                sort: ["name"],
            })
                .then(MetadataUtilities.mergeEntitiesResults)
                .then((colorPalettes) =>
                    preferNativeById(colorPalettes.data)
                        .filter((colorPaletteData) =>
                            isValidColorPalette(getColorPaletteFromMDObject(colorPaletteData)),
                        )
                        .map(convertColorPaletteWithLinks),
                ),
        );
    }

    /**
     * Read one color palette by reference, wherever the workspace can see it.
     *
     * @remarks
     * Fetched by id rather than found in the listing above: that one asks for `origin: "NATIVE"`,
     * so it never holds a palette the workspace inherits from its parent. The scope comes from the
     * reference type, the same discriminator the active color palette setting carries.
     */
    public async getColorPaletteByRef(colorPaletteRef: ObjRef): Promise<IColorPalette | undefined> {
        const id = objRefToIdentifier(colorPaletteRef, this.authCall);
        const filter = `id=="${id}"`;
        const isWorkspaceScoped =
            isIdentifierRef(colorPaletteRef) && colorPaletteRef.type === "workspaceColorPalette";

        const fetchList: (client: ITigerClientBase) => AxiosPromise<any> = isWorkspaceScoped
            ? (client) =>
                  EntitiesApi_GetAllEntitiesWorkspaceColorPalettes(client.axios, client.basePath, {
                      workspaceId: this.workspace,
                      filter,
                  })
            : (client) => EntitiesApi_GetAllEntitiesColorPalettes(client.axios, client.basePath, { filter });

        // Malformed content is no palette at all, so the caller falls back to whatever it would use
        // without a reference rather than drawing colors that are not colors.
        return this.resolveActiveStyleContent<IColorPalette | undefined>(
            fetchList,
            (content) => {
                const colorPalette = unwrapColorPaletteContent(content);
                return isValidColorPalette(colorPalette) ? colorPalette : undefined;
            },
            undefined,
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
