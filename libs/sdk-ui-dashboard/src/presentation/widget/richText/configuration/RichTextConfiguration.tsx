// (C) 2025-2026 GoodData Corporation

import cx from "classnames";

import { isRichTextWidget, objRefToString } from "@gooddata/sdk-model";
import { OverlayController, OverlayControllerProvider, ScrollablePanel } from "@gooddata/sdk-ui-kit";
import { stringUtils } from "@gooddata/util";

import { RichTextFilters } from "./RichTextFilters.js";
import { DASHBOARD_HEADER_OVERLAYS_Z_INDEX } from "../../../constants/zIndex.js";
import { type IRichTextMenuSubmenuComponentProps } from "../../richTextMenu/types.js";

const overlayController = OverlayController.getInstance(DASHBOARD_HEADER_OVERLAYS_Z_INDEX);

export function RichTextConfiguration({ widget }: IRichTextMenuSubmenuComponentProps) {
    const widgetRefSuffix = isRichTextWidget(widget)
        ? stringUtils.simplifyText(objRefToString(widget.ref))
        : "";

    const classes = cx(
        "configuration-scrollable-panel",
        "s-configuration-scrollable-panel",
        `s-rich-text-${widgetRefSuffix}`,
    );

    return (
        <ScrollablePanel className={classes}>
            <OverlayControllerProvider overlayController={overlayController}>
                <RichTextFilters widget={widget} />
            </OverlayControllerProvider>
        </ScrollablePanel>
    );
}
