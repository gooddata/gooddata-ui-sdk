// (C) 2024 GoodData Corporation
import React from "react";
import { GenAIChatWrapper } from "./GenAIChatWrapper.js";
import { Icon, Overlay } from "@gooddata/sdk-ui-kit";
import {
    clearThreadAction,
    hasMessagesSelector,
    isFullscreenSelector,
    RootState,
    setFullscreenAction,
} from "../store/index.js";
import cx from "classnames";
import { HeaderIcon } from "./HeaderIcon.js";
import { connect } from "react-redux";
import { injectIntl, WrappedComponentProps } from "react-intl";

type GenAIChatOverlayOwnProps = {
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

const GenAIChatOverlayComponent: React.FC<GenAIChatOverlayProps & WrappedComponentProps> = ({
    onClose,
    hasMessages,
    clearThread,
    intl,
    isFullscreen,
    setFullscreen,
}) => {
    const classNames = cx("gd-gen-ai-chat__window", {
        "gd-gen-ai-chat__window--fullscreen": isFullscreen,
    });

    return (
        <Overlay
            isModal={isFullscreen}
            positionType="fixed"
            alignPoints={[{ align: isFullscreen ? "cc cc" : "br br" }]}
            closeOnEscape={true}
            closeOnParentScroll={false}
            closeOnOutsideClick={false}
            closeOnMouseDrag={false}
            onClose={onClose}
        >
            <div className={classNames}>
                <div className="gd-gen-ai-chat__window__header">
                    <HeaderIcon
                        Icon={Icon.Undo}
                        className="gd-gen-ai-chat__window__header__icon--reset"
                        tooltip={intl.formatMessage({ id: "gd.gen-ai.header.reset-tooltip" })}
                        onClick={() => clearThread()}
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
                        onClick={() => setFullscreen({ isFullscreen: !isFullscreen })}
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
            </div>
        </Overlay>
    );
};

const mapStateToProps = (state: RootState): GenAIChatOverlayStateProps => ({
    hasMessages: hasMessagesSelector(state),
    isFullscreen: isFullscreenSelector(state),
});

const mapDispatchToProps: GenAIChatOverlayDispatchProps = {
    clearThread: clearThreadAction,
    setFullscreen: setFullscreenAction,
};

export const GenAIChatOverlay = connect(
    mapStateToProps,
    mapDispatchToProps,
)(injectIntl(GenAIChatOverlayComponent));
