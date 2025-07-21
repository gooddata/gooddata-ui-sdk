// (C) 2007-2025 GoodData Corporation
import cx from "classnames";

import {
    DashboardLayoutItemViewRenderer,
    IDashboardLayoutItemRenderProps,
} from "../../../DefaultDashboardLayoutRenderer/index.js";
import { areObjRefsEqual, idRef, ObjRef } from "@gooddata/sdk-model";
import { IDashboardEditLayoutContent } from "./DashboardEditLayoutTypes.js";

export interface IDashboardEditLayoutItemRendererStateProps {
    hiddenWidgetRef?: ObjRef;
}

export type IDashboardEditLayoutItemRendererOwnProps =
    IDashboardLayoutItemRenderProps<IDashboardEditLayoutContent>;

export type IDashboardEditLayoutItemRendererProps = IDashboardEditLayoutItemRendererOwnProps &
    IDashboardEditLayoutItemRendererStateProps;

export function RenderDashboardEditLayoutItemRenderer({
    children,
    item,
    hiddenWidgetRef = idRef("hiddenWidget"),
}: IDashboardEditLayoutItemRendererProps) {
    const content = item.widget();

    const isLastInSection = item.isLast();
    const isLastSection = item.section().isLast();
    const isLast = isLastSection && isLastInSection;

    const className = cx({
        last: content?.type === "widget" ? isLast : false,
    });

    const isHidden = content && isHiddenContent(content, hiddenWidgetRef);

    return (
        // @ts-expect-error types are not compatible
        <DashboardLayoutItemViewRenderer isHidden={isHidden} {...props} className={className}>
            {children}
        </DashboardLayoutItemViewRenderer>
    );
}

export const DashboardEditLayoutItemRenderer = RenderDashboardEditLayoutItemRenderer;

export const isHiddenContent = (content: IDashboardEditLayoutContent, hiddenWidgetRef: ObjRef) => {
    if (content.type === "widgetDropzoneHotspot") {
        return areObjRefsEqual(content.widgetRef, hiddenWidgetRef);
    }

    return areObjRefsEqual(content.ref, hiddenWidgetRef);
};
