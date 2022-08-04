// (C) 2021-2022 GoodData Corporation

/**
 * @alpha
 */
export interface IWidgetPlaceholderSpec {
    sectionIndex: number;
    itemIndex: number;
    size: {
        width: number;
        height: number;
    };
}

/**
 * @alpha
 */
export interface PlaceholdersState {
    widgetPlaceholder: IWidgetPlaceholderSpec | undefined;
}

export const placeholdersInitialState: PlaceholdersState = {
    widgetPlaceholder: undefined,
};
