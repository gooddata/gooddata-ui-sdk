// (C) 2024-2025 GoodData Corporation
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useIntl } from "react-intl";
import { Dialog, Icon } from "@gooddata/sdk-ui-kit";
import cx from "classnames";

import {
    clearThreadAction,
    hasMessagesSelector,
    isFullscreenSelector,
    setFullscreenAction,
} from "../store/index.js";

import { GenAIChatWrapper } from "./GenAIChatWrapper.js";
import { HeaderIcon } from "./HeaderIcon.js";

type GenAIChatOverlayProps = {
    onClose: () => void;
};

export function GenAIChatOverlay({ onClose }: GenAIChatOverlayProps) {
    const intl = useIntl();
    const dispatch = useDispatch();

    const hasMessages = useSelector(hasMessagesSelector);
    const isFullscreen = useSelector(isFullscreenSelector);

    const classNames = cx("gd-gen-ai-chat__window", {
        "gd-gen-ai-chat__window--fullscreen": isFullscreen,
    });

    return (
        <Dialog
            isModal={isFullscreen}
            alignPoints={[{ align: isFullscreen ? "cc cc" : "br br" }]}
            submitOnEnterKey={false}
            closeOnEscape={true}
            closeOnParentScroll={false}
            closeOnMouseDrag={false}
            onClose={onClose}
            className={classNames}
            accessibilityConfig={{
                title: intl.formatMessage({ id: "gd.gen-ai.dialog.label" }),
                isModal: isFullscreen,
            }}
        >
            <div className="gd-gen-ai-chat__window__header">
                <HeaderIcon
                    Icon={Icon.Undo}
                    className="gd-gen-ai-chat__window__header__icon--reset"
                    tooltip={intl.formatMessage({ id: "gd.gen-ai.header.reset-tooltip" })}
                    onClick={() => dispatch(clearThreadAction())}
                    disabled={!hasMessages}
                />
                <div className="gd-gen-ai-chat__window__header__gap"></div>
                <HeaderIcon
                    Icon={isFullscreen ? Icon.Contract : Icon.Expand}
                    className="gd-gen-ai-chat__window__header__icon--fullscreen"
                    tooltip={
                        isFullscreen
                            ? intl.formatMessage({ id: "gd.gen-ai.header.contract-tooltip" })
                            : intl.formatMessage({ id: "gd.gen-ai.header.expand-tooltip" })
                    }
                    onClick={() => dispatch(setFullscreenAction({ isFullscreen: !isFullscreen }))}
                />
                <div className="gd-gen-ai-chat__window__header__divider"></div>
                <HeaderIcon
                    Icon={Icon.Close}
                    className="gd-gen-ai-chat__window__header__icon--close"
                    tooltip={intl.formatMessage({ id: "gd.gen-ai.header.close-tooltip" })}
                    onClick={onClose}
                />
            </div>
            <GenAIChatWrapper autofocus />
        </Dialog>
    );
}
