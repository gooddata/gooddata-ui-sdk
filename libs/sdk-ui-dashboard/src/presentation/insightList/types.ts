// (C) 2022 GoodData Corporation
import { IInsight } from "@gooddata/sdk-model";
import { IRenderItemProps } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export interface IInsightListProps {
    height?: number;
    searchAutofocus?: boolean;
    noDataButton?: INoDataButton;
    renderItem?: (props: IRenderItemProps<IInsight>) => React.ReactNode;
}

/**
 * @internal
 */
export interface INoDataButton {
    className: string;
    onClick?: () => void;
    value?: string;
}
