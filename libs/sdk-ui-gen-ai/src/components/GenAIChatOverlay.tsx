// (C) 2024 GoodData Corporation
import React from "react";
import { GenAIChatWrapper } from "./GenAIChatWrapper.js";
import { Icon, Overlay } from "@gooddata/sdk-ui-kit";
import { clearMessagesAction, hasMessagesSelector, RootState } from "../store/index.js";
import cx from "classnames";
import { HeaderIcon } from "./HeaderIcon.js";
import { connect } from "react-redux";

type GenAIChatOverlayOwnProps = {
    onClose: () => void;
};

type GenAIChatOverlayStateProps = {
    hasMessages: boolean;
};

type GenAIChatOverlayDispatchProps = {
    clearMessages: typeof clearMessagesAction;
};

export type GenAIChatOverlayProps = GenAIChatOverlayOwnProps &
    GenAIChatOverlayStateProps &
    GenAIChatOverlayDispatchProps;

const GenAIChatOverlayComponent: React.FC<GenAIChatOverlayProps> = ({
    onClose,
    hasMessages,
    clearMessages,
}) => {
    const [isFullScreen, setIsFullScreen] = React.useState(false);

    const isModal = isFullScreen;

    const classNames = cx("gd-gen-ai-chat__window", {
        "gd-gen-ai-chat__window--fullscreen": isFullScreen,
    });

    return (
        <Overlay
            isModal={isModal}
            positionType="fixed"
            alignPoints={[{ align: isModal ? "cc cc" : "br br" }]}
            closeOnEscape={true}
            closeOnParentScroll={false}
            closeOnOutsideClick={false}
            closeOnMouseDrag={false}
            zIndex={6000}
            onClose={onClose}
        >
            <div className={classNames}>
                <div className="gd-gen-ai-chat__window__header">
                    <HeaderIcon
                        Icon={Icon.Undo}
                        className="gd-gen-ai-chat__window__header__icon--reset"
                        tooltip="Reset"
                        onClick={() => clearMessages()}
                        disabled={!hasMessages}
                    />
                    <div className="gd-gen-ai-chat__window__header__gap"></div>
                    <HeaderIcon
                        Icon={isFullScreen ? Icon.Contract : Icon.Expand}
                        className="gd-gen-ai-chat__window__header__icon--fullscreen"
                        tooltip={isFullScreen ? "Contract" : "Expand"}
                        onClick={() => setIsFullScreen(!isFullScreen)}
                    />
                    <div className="gd-gen-ai-chat__window__header__divider"></div>
                    <HeaderIcon
                        Icon={Icon.Close}
                        className="gd-gen-ai-chat__window__header__icon--close"
                        tooltip="Close"
                        onClick={onClose}
                    />
                </div>
                <GenAIChatWrapper />
            </div>
        </Overlay>
    );
};

const mapStateToProps = (state: RootState): GenAIChatOverlayStateProps => ({
    hasMessages: hasMessagesSelector(state),
});

const mapDispatchToProps: GenAIChatOverlayDispatchProps = {
    clearMessages: clearMessagesAction,
};

export const GenAIChatOverlay = connect(mapStateToProps, mapDispatchToProps)(GenAIChatOverlayComponent);
