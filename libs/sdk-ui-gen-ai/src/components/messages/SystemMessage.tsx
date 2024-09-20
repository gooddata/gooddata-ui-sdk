// (C) 2024 GoodData Corporation

import React from "react";
import { SystemMessage } from "../../model.js";

type SystemMessageProps = {
    message: SystemMessage;
};

export const SystemMessageComponent: React.FC<SystemMessageProps> = ({ message }) => {
    return (
        <div className="gd-gen-ai-chat__messages__message mgd-gen-ai-chat__messages__message--system">
            <div className="gd-gen-ai-chat__messages__contents">{message.content}</div>
        </div>
    );
};
