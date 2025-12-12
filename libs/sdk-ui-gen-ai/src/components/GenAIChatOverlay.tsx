// (C) 2024-2025 GoodData Corporation

import { type FC, type RefObject } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";
import { connect } from "react-redux";

import { Dialog } from "@gooddata/sdk-ui-kit";

import { GenAIChatWrapper } from "./GenAIChatWrapper.js";
import { HeaderIcon } from "./HeaderIcon.js";
import {
    type RootState,
    clearThreadAction,
    hasMessagesSelector,
    isFullscreenSelector,
    setFullscreenAction,
} from "../store/index.js";

type GenAIChatOverlayOwnProps = {
    returnFocusTo?: RefObject<HTMLElement | null> | string;
    onClose: () => void;
};

type GenAIChatOverlayStateProps = {
    hasMessages: boolean;
    isFullscreen: boolean;
};

type GenAIChatOverlayDispatchProps = {
    clearThread: typeof clearThreadAction;
    setFullscreen: typeof setFullscreenAction;
};

export type GenAIChatOverlayProps = GenAIChatOverlayOwnProps &
    GenAIChatOverlayStateProps &
    GenAIChatOverlayDispatchProps;

function GenAIChatOverlayComponent({
    onClose,
    returnFocusTo,
    hasMessages,
    clearThread,
    isFullscreen,
    setFullscreen,
}: GenAIChatOverlayProps) {
    const intl = useIntl();

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
            <div className="gd-gen-ai-chat__window__header">
                <HeaderIcon
                    icon="ccw"
                    tooltip={intl.formatMessage({ id: "gd.gen-ai.header.reset-tooltip" })}
                    onClick={() => clearThread()}
                    disabled={!hasMessages}
                />
                <div className="gd-gen-ai-chat__window__header__gap"></div>
                <HeaderIcon
                    icon={isFullscreen ? "minimize" : "expand"}
                    tooltip={
                        isFullscreen
                            ? intl.formatMessage({ id: "gd.gen-ai.header.contract-tooltip" })
                            : intl.formatMessage({ id: "gd.gen-ai.header.expand-tooltip" })
                    }
                    onClick={() => setFullscreen({ isFullscreen: !isFullscreen })}
                />
                <div className="gd-gen-ai-chat__window__header__divider"></div>
                <HeaderIcon icon="cross" onClick={onClose} />
            </div>
            <GenAIChatWrapper autofocus />
        </Dialog>
    );
}

const mapStateToProps = (state: RootState): GenAIChatOverlayStateProps => ({
    hasMessages: hasMessagesSelector(state),
    isFullscreen: isFullscreenSelector(state),
});

const mapDispatchToProps: GenAIChatOverlayDispatchProps = {
    clearThread: clearThreadAction,
    setFullscreen: setFullscreenAction,
};

export const GenAIChatOverlay: FC<GenAIChatOverlayOwnProps> = connect(
    mapStateToProps,
    mapDispatchToProps,
)(GenAIChatOverlayComponent);
