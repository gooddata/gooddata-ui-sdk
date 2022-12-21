// (C) 2022 GoodData Corporation
import { IInsight, ObjRef } from "@gooddata/sdk-model";
import { IRenderListItemProps } from "@gooddata/sdk-ui-kit";
import { IWrapInsightListItemWithDragComponent } from "../dragAndDrop/types";

/**
 * @internal
 */
export interface IInsightListProps {
    WrapInsightListItemWithDragComponent?: IWrapInsightListItemWithDragComponent;
    height?: number;
    width?: number;
    searchAutofocus?: boolean;
    noDataButton?: INoDataButton;
    renderItem?: (props: IRenderListItemProps<IInsight>) => JSX.Element;
    selectedRef?: ObjRef;
    onSelect?: (insight: IInsight) => void;
    enableDescriptions?: boolean;
}

/**
 * @internal
 */
export interface INoDataButton {
    className: string;
    onClick?: () => void;
    value?: string;
}
