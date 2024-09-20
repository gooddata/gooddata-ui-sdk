// (C) 2024 GoodData Corporation
import React from "react";
import { GenAIChatWrapper } from "./GenAIChatWrapper.js";
import { Icon, Overlay } from "@gooddata/sdk-ui-kit";
import { clearMessagesAction, hasMessagesSelector } from "../store/index.js";
import cx from "classnames";
import { HeaderIcon } from "./HeaderIcon.js";
import { useDispatch, useSelector } from "react-redux";

export type GenAIChatOverlayProps = {
    onClose: () => void;
};

export const GenAIChatOverlay: React.FC<GenAIChatOverlayProps> = ({ onClose }) => {
    const [isFullScreen, setIsFullScreen] = React.useState(false);
    const dispatch = useDispatch();
    const hasMessages = useSelector(hasMessagesSelector);

    const isModal = isFullScreen;

    const reset = () => {
        dispatch(clearMessagesAction());
    };

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
                        onClick={reset}
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
