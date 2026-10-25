// (C) 2023-2026 GoodData Corporation

export const getVisualizationPickerRowLength = (visClassCount: number) => {
    if (Math.ceil(visClassCount / 5) < Math.ceil(visClassCount / 4)) {
        return 5;
    }

    return 4;
};
