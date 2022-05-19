// (C) 2022 GoodData Corporation

/**
 * @internal
 */
export interface IInsightListProps {
    height: number;
    searchAutofocus?: boolean;
    noDataButton?: INoDataButton;
}

/**
 * @internal
 */
export interface INoDataButton {
    className: string;
    onClick?: () => void;
    value?: string;
}
