// (C) 2023 GoodData Corporation

import React, { ReactNode } from "react";
import { FormattedMessage } from "react-intl";

import { Message } from "../../../Messages/index.js";

interface IAdminInformationMessageProps {
    isVisible: boolean;
    onClose: () => void;
}

export const AdminInformationMessage: React.FC<IAdminInformationMessageProps> = ({ isVisible, onClose }) => {
    if (!isVisible) {
        return null;
    }

    return (
        <Message
            type="progress"
            className="gd-granular-permissions-admin-information s-granular-permissions-admin-information"
            onClose={onClose}
        >
            <span aria-label="Share dialog admin information message">
                <FormattedMessage
                    id="shareDialog.share.granular.administrator.info"
                    values={{ b: (chunks: ReactNode) => <strong>{chunks}</strong> }}
                />
            </span>
        </Message>
    );
};
