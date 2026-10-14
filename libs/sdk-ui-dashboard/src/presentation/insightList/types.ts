// (C) 2022-2026 GoodData Corporation

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
    renderItem?: (props: IRenderListItemProps<InsightListRow>) => ReactElement;
    selectedRef?: ObjRef;
    onSelect?: (insight: IInsight) => void;
    disabled?: boolean;
    includePermissions?: boolean;
    excludeRefs?: ObjRef[];
}

/**
 * Related rows come from the semantic search and carry no permissions, so they take no actions.
 *
 * @internal
 */
export type InsightListRow = (IInsight & { isRelated?: boolean }) | { divider: true };
