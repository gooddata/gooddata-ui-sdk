// (C) 2025-2026 GoodData Corporation

import { type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import {
    type CatalogItem,
    type GenAIObjectType,
    type IColorPalette,
    type IInsight,
    type IListedDashboard,
} from "@gooddata/sdk-model";

import type { GenAIAssistantMode, LinkHandlerEvent } from "../components/ConfigContext.js";

/**
 * A dispatcher for chat events.
 * @internal
 */
export class OptionsDispatcher {
    private colorPalette: IColorPalette | undefined = undefined;
    private settings: IUserWorkspaceSettings | undefined = undefined;
    private objectTypes: GenAIObjectType[] | undefined = undefined;
    private includeTags: string[] | undefined = undefined;
    private excludeTags: string[] | undefined = undefined;
    private catalogItems: CatalogItem[] | undefined = undefined;
    private dashboards: IListedDashboard[] | undefined = undefined;
    private visualizations: IInsight[] | undefined = undefined;
    private mode: GenAIAssistantMode | undefined = undefined;
    private onLinkClick: ((linkClickEvent: LinkHandlerEvent) => string | undefined) | undefined = undefined;
    private onLinkClickHandlers = new Set<(linkClickEvent: LinkHandlerEvent) => string | undefined>();
    private allowNativeLinks: boolean | undefined = undefined;

    public setColorPalette(colorPalette: IColorPalette | undefined): void {
        this.colorPalette = colorPalette;
    }

    public getColorPalette(): IColorPalette | undefined {
        return this.colorPalette;
    }

    public setOnLinkClick(
        onLinkClick?: (linkClickEvent: LinkHandlerEvent) => string | undefined,
        allowNativeLinks?: boolean,
    ): void {
        this.onLinkClick = onLinkClick;
        this.allowNativeLinks = allowNativeLinks;
    }

    public registerLinkHandler(
        handler: (linkClickEvent: LinkHandlerEvent) => string | undefined,
    ): () => void {
        this.onLinkClickHandlers.add(handler);
        return () => this.onLinkClickHandlers.delete(handler);
    }

    public getOnLinkClick(): {
        onLinkClick?: (linkClickEvent: LinkHandlerEvent) => string | undefined;
        allowNativeLinks?: boolean;
    } {
        const onLinkClick =
            this.onLinkClick || this.onLinkClickHandlers.size > 0
                ? (event: LinkHandlerEvent) => {
                      const resultCurrent = this.onLinkClick?.(event);
                      let resultParents: string | undefined;
                      this.onLinkClickHandlers.forEach((handler) => {
                          resultParents = handler(event) ?? resultParents;
                      });
                      return resultParents ?? resultCurrent;
                  }
                : undefined;

        return {
            onLinkClick,
            allowNativeLinks: this.allowNativeLinks,
        };
    }

    public setSettings(settings: IUserWorkspaceSettings | undefined): void {
        this.settings = settings;
    }

    public getSettings(): IUserWorkspaceSettings | undefined {
        return this.settings;
    }

    public setObjectTypes(objectTypes: GenAIObjectType[] | undefined): void {
        this.objectTypes = objectTypes;
    }

    public getObjectTypes(): GenAIObjectType[] | undefined {
        return this.objectTypes;
    }

    public setTags(includeTags: string[] | undefined, excludeTags: string[] | undefined): void {
        this.includeTags = includeTags;
        this.excludeTags = excludeTags;
    }

    public getTags(): { includeTags: string[] | undefined; excludeTags: string[] | undefined } {
        return {
            includeTags: this.includeTags,
            excludeTags: this.excludeTags,
        };
    }

    public setCatalogItems(catalogItems: CatalogItem[] | undefined): void {
        this.catalogItems = catalogItems;
    }

    public getCatalogItems(): CatalogItem[] | undefined {
        return this.catalogItems;
    }

    public setDashboards(dashboards: IListedDashboard[] | undefined): void {
        this.dashboards = dashboards;
    }

    public getDashboards(): IListedDashboard[] | undefined {
        return this.dashboards;
    }

    public setVisualizations(visualizations: IInsight[] | undefined): void {
        this.visualizations = visualizations;
    }

    public getVisualizations(): IInsight[] | undefined {
        return this.visualizations;
    }

    public setMode(mode: GenAIAssistantMode | undefined): void {
        this.mode = mode;
    }

    public getMode(): GenAIAssistantMode | undefined {
        return this.mode;
    }
}
