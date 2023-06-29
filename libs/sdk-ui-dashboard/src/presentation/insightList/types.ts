// (C) 2022-2023 GoodData Corporation
import { IInsight, ObjRef } from "@gooddata/sdk-model";
import { IRenderListItemProps } from "@gooddata/sdk-ui-kit";
import { IWrapInsightListItemWithDragComponent } from "../dragAndDrop/types.js";

/**
 * @internal
 */
export interface IInsightListProps {
    WrapInsightListItemWithDragComponent?: IWrapInsightListItemWithDragComponent;
    height?: number;
    width?: number;
    searchAutofocus?: boolean;
    renderItem?: (props: IRenderListItemProps<IInsight>) => JSX.Element;
    selectedRef?: ObjRef;
    onSelect?: (insight: IInsight) => void;
    enableDescriptions?: boolean;
}
