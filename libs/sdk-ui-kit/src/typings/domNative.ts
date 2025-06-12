// (C) 2020-2021 GoodData Corporation

/**
 * @internal
 */
export interface IDomNative {
    focus: (options?: { preventScroll?: boolean }) => void;
}

/**
 * @internal
 */
export interface IDomNativeProps {
    autofocus?: boolean;
}
