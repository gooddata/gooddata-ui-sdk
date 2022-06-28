// (C) 2022 GoodData Corporation

/**
 * When stacking the overlays, next overlay is going to have an z-index higher by 10.
 */
const Z_INDEX_STEP = 10;

/**
 * Overlay stacking controller.
 *
 * @internal
 */
export class OverlayController {
    private static instance: OverlayController | undefined;
    private currentCount = 0;
    private initialZIndex: number = 5001;
    private overlays: Map<string, number>;

    private constructor() {
        this.overlays = new Map<string, number>();
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new OverlayController();
        }
        return this.instance;
    }

    /**
     * Adds the overlay record to the map.
     *
     * @param uuid - given overlay uuid.
     */
    public addOverlay(uuid: string): void {
        this.overlays.set(uuid, ++this.currentCount);
    }

    /**
     * Getter for z-index of the given overlay.
     *
     * @remarks
     * If the entry in the overlays map is not available, the initial z-index of 5001 is used.
     *
     * @param uuid - unique identifier of the overlay.
     * @returns
     */
    public getZIndex(uuid: string): number {
        return this.initialZIndex + (this.overlays.get(uuid) || 0) * Z_INDEX_STEP;
    }

    /**
     * Removes given overlay from the overlays map.
     *
     * @param uuid - unique identifier of the overlay
     */
    public removeOverlay(uuid: string): void {
        this.overlays.delete(uuid);
        this.currentCount--;
    }
}
