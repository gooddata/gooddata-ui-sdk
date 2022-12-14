// (C) 2022 GoodData Corporation

/**
 * When stacking the overlays, next overlay is going to have an z-index higher by 1.
 */
const Z_INDEX_STEP = 1;

const DEFAULT_INIT_Z_INDEX = 5001;

/**
 * Overlay stacking controller.
 *
 * @internal
 */
export class OverlayController {
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
        const maxIndex = this.getMaxZIndex();

        this.overlays.set(uuid, maxIndex + Z_INDEX_STEP);
    }

    /**
     * Get maximum z-Index from current opened overlays
     * @returns
     */
    private getMaxZIndex(): number {
        let maxIndex = 0;

        this.overlays.forEach((value) => {
            maxIndex = Math.max(maxIndex, value);
        });

        return maxIndex || this.initialZIndex;
    }

    /**
     * Getter for z-index of the given overlay.
     *
     * @remarks
     * If the entry in the overlays map is not available, the initial z-index is used.
     *
     * @param uuid - unique identifier of the overlay.
     * @returns
     */
    public getZIndex(uuid: string): number {
        return this.overlays.get(uuid) || this.initialZIndex;
    }

    /**
     * Removes given overlay from the overlays map.
     *
     * @param uuid - unique identifier of the overlay
     */
    public removeOverlay(uuid: string): void {
        this.overlays.delete(uuid);
    }
}
