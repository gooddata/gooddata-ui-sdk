// (C) 2022 GoodData Corporation

export const DEBUG_SHOW_DROP_ZONES = false;

export function getDropZoneDebugStyle({ isOver = false }) {
    if (!DEBUG_SHOW_DROP_ZONES) {
        return {};
    }

    return isOver
        ? { backgroundColor: "rgba(0, 255, 0, 0.4)" }
        : { backgroundColor: "rgba(0, 255, 0, 0.08)" };
}
