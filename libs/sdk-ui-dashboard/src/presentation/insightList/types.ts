// (C) 2022 GoodData Corporation
import { IRenderItemProps } from "@gooddata/sdk-ui-kit";
import { IInsight, ObjRef } from "@gooddata/sdk-model";

/**
 * @internal
 */
export interface IInsightListProps {
    height?: number;
    searchAutofocus?: boolean;
    noDataButton?: INoDataButton;
    renderItem?: (props: IRenderItemProps<IInsight>) => React.ReactNode;
    selectedRef?: ObjRef;
    onSelect?: (insight: IInsight) => void;
}

/**
 * @internal
 */
export interface INoDataButton {
    className: string;
    onClick?: () => void;
    value?: string;
}
