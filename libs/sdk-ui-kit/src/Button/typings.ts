// (C) 2020 GoodData Corporation

/**
 * @internal
 */
export interface IButtonProps {
    className?: string;
    disabled?: boolean;
    tabIndex?: number;
    tagName?: string;
    title?: string;
    type?: string;
    value?: string;
    iconLeft?: string;
    iconRight?: string;
    onClick?(e: React.MouseEvent): void;
}
