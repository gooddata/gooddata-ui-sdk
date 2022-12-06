// (C) 2022 GoodData Corporation

/**
 * When stacking the overlays, next overlay is going to have an z-index higher by 10.
 */
const Z_INDEX_STEP = 10;

const DEFAULT_INIT_Z_INDEX = 5001;
/**
 * Overlay stacking controller.
 *
 * @internal
 */
export class OverlayController {
    private currentCount = 0;
    private initialZIndex: number = DEFAULT_INIT_Z_INDEX;
    private overlays: Map<string, number>;

    private constructor(initialZIndex: number = DEFAULT_INIT_Z_INDEX) {
        this.overlays = new Map<string, number>();
        this.initialZIndex = initialZIndex;
    }

    public static getInstance(initialZIndex: number = DEFAULT_INIT_Z_INDEX) {
        return new OverlayController(initialZIndex);
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
