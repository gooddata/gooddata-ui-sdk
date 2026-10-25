// (C) 2026 GoodData Corporation

// The AD runtime keeps its state in one module-level store, so two mounted instances would share it.
let isClaimed = false;

export const SECOND_MOUNT_ERROR_MESSAGE =
    "Analytical Designer is already mounted on this page. Unmount it before you mount another instance.";

/** Claims the single AD runtime; returns false when another instance holds it. */
export function claimAnalyticalDesignerRuntime(): boolean {
    if (isClaimed) {
        return false;
    }
    isClaimed = true;
    return true;
}

/** Releases the AD runtime the unmounted instance held. */
export function releaseAnalyticalDesignerRuntime(): void {
    isClaimed = false;
}
