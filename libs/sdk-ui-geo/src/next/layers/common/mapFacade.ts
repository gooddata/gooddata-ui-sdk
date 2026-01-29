// (C) 2025-2026 GoodData Corporation

import type {
    CircleLayerSpecification as MapLibreCircleLayerSpecification,
    ExpressionSpecification as MapLibreExpressionSpecification,
    FillLayerSpecification as MapLibreFillLayerSpecification,
    FilterSpecification as MapLibreFilterSpecification,
    GeoJSONSourceSpecification as MapLibreGeoJSONSourceSpecification,
    LineLayerSpecification as MapLibreLineLayerSpecification,
    LngLatBoundsLike as MapLibreLngLatBoundsLike,
    LngLatLike as MapLibreLngLatLike,
    Map as MapLibreMap,
    MapMouseEvent as MapLibreMapMouseEvent,
    MapOptions as MapLibreMapOptions,
    Popup as MapLibrePopup,
    PopupOptions as MapLibrePopupOptions,
    StyleSpecification as MapLibreStyleSpecification,
    SymbolLayerSpecification as MapLibreSymbolLayerSpecification,
} from "maplibre-gl";

export type Map = MapLibreMap;
export type Popup = MapLibrePopup;

/**
 * MapLibre style specification.
 *
 * @public
 */
export type StyleSpecification = MapLibreStyleSpecification;
export type GeoJSONSourceSpecification = MapLibreGeoJSONSourceSpecification;
export type FilterSpecification = MapLibreFilterSpecification;
export type ExpressionSpecification = MapLibreExpressionSpecification;
export type CircleLayerSpecification = MapLibreCircleLayerSpecification;
export type SymbolLayerSpecification = MapLibreSymbolLayerSpecification;
export type FillLayerSpecification = MapLibreFillLayerSpecification;
export type LineLayerSpecification = MapLibreLineLayerSpecification;
export type LngLatLike = MapLibreLngLatLike;
export type LngLatBoundsLike = MapLibreLngLatBoundsLike;
export type MapOptions = MapLibreMapOptions;
export type PopupOptions = MapLibrePopupOptions;
export type MapMouseEvent = MapLibreMapMouseEvent;

type OnceArgs = Parameters<MapLibreMap["once"]>;
type OnArgs = Parameters<MapLibreMap["on"]>;
type OffArgs = Parameters<MapLibreMap["off"]>;
type AddSourceArgs = Parameters<MapLibreMap["addSource"]>;
type AddLayerArgs = Parameters<MapLibreMap["addLayer"]>;
type GetLayerArgs = Parameters<MapLibreMap["getLayer"]>;
type GetSourceArgs = Parameters<MapLibreMap["getSource"]>;
type RemoveLayerArgs = Parameters<MapLibreMap["removeLayer"]>;
type RemoveSourceArgs = Parameters<MapLibreMap["removeSource"]>;
type ResizeArgs = Parameters<MapLibreMap["resize"]>;
type CameraForBoundsArgs = Parameters<MapLibreMap["cameraForBounds"]>;
type CameraForBoundsResult = ReturnType<MapLibreMap["cameraForBounds"]>;
type FlyToArgs = Parameters<MapLibreMap["flyTo"]>;
type JumpToArgs = Parameters<MapLibreMap["jumpTo"]>;
type PanToArgs = Parameters<MapLibreMap["panTo"]>;
type ZoomToArgs = Parameters<MapLibreMap["zoomTo"]>;
type QueryRenderedFeaturesArgs = Parameters<MapLibreMap["queryRenderedFeatures"]>;
type QueryRenderedFeaturesResult = ReturnType<MapLibreMap["queryRenderedFeatures"]>;
type SetLayoutPropertyArgs = Parameters<MapLibreMap["setLayoutProperty"]>;
type SetFilterArgs = Parameters<MapLibreMap["setFilter"]>;
type StyleResult = ReturnType<MapLibreMap["getStyle"]>;
type CenterResult = ReturnType<MapLibreMap["getCenter"]>;
type ZoomResult = ReturnType<MapLibreMap["getZoom"]>;
type LoadedResult = ReturnType<MapLibreMap["loaded"]>;
type TilesLoadedResult = ReturnType<MapLibreMap["areTilesLoaded"]>;

/**
 * Minimal subset of MapLibre map APIs used across Geo logic and tests.
 *
 * @internal
 */
export const MAP_FACADE_SOURCE = Symbol("mapFacadeSource");

export interface IMapFacade {
    isStyleLoaded(): boolean;
    once(...args: OnceArgs): IMapFacade;
    on(...args: OnArgs): IMapFacade;
    off(...args: OffArgs): IMapFacade;
    addSource(...args: AddSourceArgs): IMapFacade;
    addLayer(...args: AddLayerArgs): IMapFacade;
    getLayer(...args: GetLayerArgs): ReturnType<MapLibreMap["getLayer"]>;
    getSource(...args: GetSourceArgs): ReturnType<MapLibreMap["getSource"]>;
    removeLayer(...args: RemoveLayerArgs): IMapFacade;
    removeSource(...args: RemoveSourceArgs): IMapFacade;
    resize(...args: ResizeArgs): IMapFacade;
    cameraForBounds(...args: CameraForBoundsArgs): CameraForBoundsResult;
    flyTo(...args: FlyToArgs): IMapFacade;
    jumpTo(...args: JumpToArgs): IMapFacade;
    panTo(...args: PanToArgs): IMapFacade;
    zoomTo(...args: ZoomToArgs): IMapFacade;
    getCenter(...args: []): CenterResult;
    getZoom(...args: []): ZoomResult;
    getStyle(): StyleResult;
    getCanvas(): HTMLCanvasElement;
    loaded(): LoadedResult;
    areTilesLoaded(): TilesLoadedResult;
    queryRenderedFeatures(...args: QueryRenderedFeaturesArgs): QueryRenderedFeaturesResult;
    setLayoutProperty(...args: SetLayoutPropertyArgs): IMapFacade;
    setFilter(...args: SetFilterArgs): IMapFacade;
    readonly [MAP_FACADE_SOURCE]?: MapLibreMap;
}

type SetLngLatArgs = Parameters<Popup["setLngLat"]>;
type SetHtmlArgs = Parameters<Popup["setHTML"]>;
type SetMaxWidthArgs = Parameters<Popup["setMaxWidth"]>;

/**
 * Minimal subset of MapLibre popup APIs required by tooltip handlers.
 *
 * @internal
 */
export interface IPopupFacade {
    setLngLat(...args: SetLngLatArgs): IPopupFacade;
    setHTML(...args: SetHtmlArgs): IPopupFacade;
    setMaxWidth(...args: SetMaxWidthArgs): IPopupFacade;
    addTo(map: IMapFacade): IPopupFacade;
    remove(): void;
    isOpen(): boolean;
}

/**
 * Wraps a MapLibre map into a lightweight facade with the subset of APIs used by Geo logic.
 *
 * @param map - MapLibre map instance
 * @returns Facade object delegating calls to the underlying map
 *
 * @internal
 */
export function createMapFacade(map: MapLibreMap): IMapFacade {
    const facade: IMapFacade = {
        isStyleLoaded: () => Boolean(map.isStyleLoaded()),
        once: (...args: OnceArgs) => {
            void map.once(...args);
            return facade;
        },
        on: (...args: OnArgs) => {
            map.on(...args);
            return facade;
        },
        off: (...args: OffArgs) => {
            map.off(...args);
            return facade;
        },
        addSource: (...args: AddSourceArgs) => {
            map.addSource(...args);
            return facade;
        },
        addLayer: (...args: AddLayerArgs) => {
            map.addLayer(...args);
            return facade;
        },
        getLayer: (...args: GetLayerArgs) => map.getLayer(...args),
        getSource: (...args: GetSourceArgs) => map.getSource(...args),
        removeLayer: (...args: RemoveLayerArgs) => {
            map.removeLayer(...args);
            return facade;
        },
        removeSource: (...args: RemoveSourceArgs) => {
            map.removeSource(...args);
            return facade;
        },
        resize: (...args: ResizeArgs) => {
            map.resize(...args);
            return facade;
        },
        cameraForBounds: (...args: CameraForBoundsArgs) => map.cameraForBounds(...args),
        flyTo: (...args: FlyToArgs) => {
            map.flyTo(...args);
            return facade;
        },
        jumpTo: (...args: JumpToArgs) => {
            map.jumpTo(...args);
            return facade;
        },
        panTo: (...args: PanToArgs) => {
            map.panTo(...args);
            return facade;
        },
        zoomTo: (...args: ZoomToArgs) => {
            map.zoomTo(...args);
            return facade;
        },
        getCenter: () => map.getCenter(),
        getZoom: () => map.getZoom(),
        getStyle: () => map.getStyle(),
        getCanvas: () => map.getCanvas(),
        loaded: () => map.loaded(),
        areTilesLoaded: () => map.areTilesLoaded(),
        queryRenderedFeatures: (...args: QueryRenderedFeaturesArgs) => map.queryRenderedFeatures(...args),
        setLayoutProperty: (...args: SetLayoutPropertyArgs) => {
            map.setLayoutProperty(...args);
            return facade;
        },
        setFilter: (...args: SetFilterArgs) => {
            map.setFilter(...args);
            return facade;
        },
        [MAP_FACADE_SOURCE]: map,
    };

    return facade;
}

/**
 * Converts a MapLibre popup into the facade used by tooltip handlers.
 *
 * @param popup - MapLibre popup instance
 * @returns Facade delegating operations to the underlying popup
 *
 * @internal
 */
export function createPopupFacade(popup: Popup): IPopupFacade {
    const facade: IPopupFacade = {
        setLngLat: (...args: SetLngLatArgs) => {
            popup.setLngLat(...args);
            return facade;
        },
        setHTML: (...args: SetHtmlArgs) => {
            popup.setHTML(...args);
            return facade;
        },
        setMaxWidth: (...args: SetMaxWidthArgs) => {
            popup.setMaxWidth(...args);
            return facade;
        },
        addTo: (mapFacade: IMapFacade) => {
            const mapInstance = getUnderlyingMap(mapFacade);
            if (mapInstance) {
                popup.addTo(mapInstance);
            }
            return facade;
        },
        remove: () => {
            popup.remove();
        },
        isOpen: () => popup.isOpen(),
    };

    return facade;
}

/**
 * Extracts the underlying MapLibre map from a facade instance (if available).
 *
 * @param map - Facade instance
 * @returns MapLibre map or undefined when the facade wraps a mock implementation
 *
 * @internal
 */
export function getUnderlyingMap(map: IMapFacade): MapLibreMap | undefined {
    return map[MAP_FACADE_SOURCE];
}
