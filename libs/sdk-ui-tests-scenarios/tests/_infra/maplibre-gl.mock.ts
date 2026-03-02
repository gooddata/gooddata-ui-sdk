// (C) 2026 GoodData Corporation

type Listener = (...args: any[]) => void;

class MockMap {
    private listeners = new globalThis.Map<string, Set<Listener>>();
    private sources = new globalThis.Map<string, any>();
    private layers = new globalThis.Map<string, any>();
    private center = { lng: 0, lat: 0 };
    private zoom = 1;
    private canvas = { style: { cursor: "" } } as HTMLCanvasElement;

    constructor(_options?: any) {}

    private emit(event: string, ...args: any[]): void {
        const handlers = this.listeners.get(event);
        if (!handlers) {
            return;
        }
        for (const handler of handlers) {
            handler(...args);
        }
    }

    on(event: string, handler: Listener): this {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(handler);
        return this;
    }

    once(event: string, handler: Listener): this {
        const wrapped = (...args: any[]) => {
            this.off(event, wrapped);
            handler(...args);
        };
        return this.on(event, wrapped);
    }

    off(event: string, handler: Listener): this {
        this.listeners.get(event)?.delete(handler);
        return this;
    }

    loaded(): boolean {
        return true;
    }

    areTilesLoaded(): boolean {
        return true;
    }

    isStyleLoaded(): boolean {
        return true;
    }

    getStyle() {
        return { version: 8, sources: {}, layers: [] };
    }

    addSource(id: string, source: any): this {
        const sourceRecord = {
            ...source,
            setData: (data: any) => {
                sourceRecord.data = data;
            },
        };
        this.sources.set(id, sourceRecord);
        return this;
    }

    getSource(id: string): any {
        return this.sources.get(id);
    }

    removeSource(id: string): this {
        this.sources.delete(id);
        return this;
    }

    addLayer(layer: any): this {
        this.layers.set(layer.id, layer);
        return this;
    }

    getLayer(id: string): any {
        return this.layers.get(id);
    }

    removeLayer(id: string): this {
        this.layers.delete(id);
        return this;
    }

    setLayoutProperty(_id: string, _name: string, _value: any): this {
        return this;
    }

    setFilter(_id: string, _filter: any): this {
        return this;
    }

    queryRenderedFeatures(_point?: any, _options?: any): any[] {
        return [];
    }

    cameraForBounds(_bounds: any, _options?: any) {
        return { center: [0, 0], zoom: 1 };
    }

    flyTo(options: any): this {
        if (options?.center) {
            this.center = { lng: options.center[0], lat: options.center[1] };
        }
        if (typeof options?.zoom === "number") {
            this.zoom = options.zoom;
        }
        this.emit("moveend");
        this.emit("zoomend");
        this.emit("idle");
        return this;
    }

    jumpTo(options: any): this {
        return this.flyTo(options);
    }

    panTo(center: [number, number], _options?: any): this {
        this.center = { lng: center[0], lat: center[1] };
        this.emit("moveend");
        this.emit("idle");
        return this;
    }

    zoomTo(zoom: number, _options?: any): this {
        this.zoom = zoom;
        this.emit("zoomend");
        this.emit("idle");
        return this;
    }

    getCenter() {
        return this.center;
    }

    getZoom(): number {
        return this.zoom;
    }

    getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    resize(): this {
        return this;
    }

    remove(): void {
        this.listeners.clear();
        this.sources.clear();
        this.layers.clear();
    }
}

class MockPopup {
    private open = false;

    setLngLat(_lngLat: any): this {
        return this;
    }

    setHTML(_html: string): this {
        return this;
    }

    setMaxWidth(_maxWidth: string): this {
        return this;
    }

    addTo(_map: any): this {
        this.open = true;
        return this;
    }

    remove(): void {
        this.open = false;
    }

    isOpen(): boolean {
        return this.open;
    }
}

export { MockMap as Map, MockPopup as Popup };
