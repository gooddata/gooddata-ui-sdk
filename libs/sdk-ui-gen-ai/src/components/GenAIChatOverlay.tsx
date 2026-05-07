// (C) 2024-2026 GoodData Corporation

import { type RefObject } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { Dialog } from "@gooddata/sdk-ui-kit";

import { GenAIChatConversations } from "./GenAIChatConversations.js";
import { GenAIChatHeader } from "./GenAIChatHeader.js";
import { GenAIChatWrapper } from "./GenAIChatWrapper.js";
import { useFullscreenCheck } from "./hooks/useFullscreenCheck.js";

export type GenAIChatOverlayProps = {
    returnFocusTo?: RefObject<HTMLElement | null> | string;
    onClose: () => void;
};

export function GenAIChatOverlay({ onClose, returnFocusTo }: GenAIChatOverlayProps) {
    const intl = useIntl();
    const { isFullscreen } = useFullscreenCheck();

    const classNames = cx("gd-gen-ai-chat__window", {
        "gd-gen-ai-chat__window--fullscreen": isFullscreen,
    });

    return (
        <Dialog
            isModal={isFullscreen}
            returnFocusTo={returnFocusTo}
            returnFocusAfterClose={!!returnFocusTo}
            alignPoints={[{ align: isFullscreen ? "cc cc" : "br br" }]}
            submitOnEnterKey={false}
            closeOnEscape
            closeOnParentScroll={false}
            closeOnMouseDrag={false}
            onClose={onClose}
            className={classNames}
            accessibilityConfig={{
                title: intl.formatMessage({ id: "gd.gen-ai.dialog.label" }),
                isModal: isFullscreen,
            }}
        >
            <GenAIChatHeader onClose={onClose} />
            <GenAIChatConversations />
            <GenAIChatWrapper autofocus />
        </Dialog>
    );
}
