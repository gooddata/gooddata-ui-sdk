// (C) 2022-2025 GoodData Corporation
import { type ReactElement } from "react";

import { type IInsight, type ObjRef } from "@gooddata/sdk-model";
import { type IRenderListItemProps } from "@gooddata/sdk-ui-kit";

import { type IWrapInsightListItemWithDragComponent } from "../dragAndDrop/types.js";

/**
 * @internal
 */
export interface IInsightListProps {
    WrapInsightListItemWithDragComponent?: IWrapInsightListItemWithDragComponent;
    height?: number;
    width?: number;
    searchAutofocus?: boolean;
    renderItem?: (props: IRenderListItemProps<IInsight>) => ReactElement;
    selectedRef?: ObjRef;
    onSelect?: (insight: IInsight) => void;
    enableDescriptions?: boolean;
}
