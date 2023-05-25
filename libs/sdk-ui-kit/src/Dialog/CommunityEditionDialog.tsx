// (C) 2021 GoodData Corporation
import React from "react";
import { Dialog } from "./Dialog.js";
import { Message } from "../Messages/index.js";
import { Button } from "../Button/index.js";

/**
 * @internal
 */
export interface ICommunityEditionDialogProps {
    onClose: () => void;
    headerText: string;
    infoText: string;
    copyrightText: string;
    links: { text: string; uri: string }[];
    closeButtonText: string;
}

/**
 * @internal
 */
export const CommunityEditionDialog: React.FC<ICommunityEditionDialogProps> = ({
    headerText,
    infoText,
    copyrightText,
    links,
    onClose,
    closeButtonText,
}) => {
    return (
        <Dialog onClose={onClose} displayCloseButton className="gd-community-dialog">
            <h3 className="gd-community-dialog-header">{headerText}</h3>
            <Message type="progress" className="gd-community-dialog-info">
                {infoText}
            </Message>
            <div className="gd-community-dialog-copyright">{copyrightText}</div>
            {links.length > 0 ? (
                <ul className="gd-community-dialog-links">
                    {links.map((link) => (
                        <li key={link.uri}>
                            <a href={link.uri} target="_blank" rel="noreferrer noopener">
                                {link.text}
                            </a>
                        </li>
                    ))}
                </ul>
            ) : null}
            <div className="gd-dialog-footer">
                <Button
                    className="gd-community-button gd-button-secondary"
                    onClick={onClose}
                    value={closeButtonText}
                    title={closeButtonText}
                />
            </div>
        </Dialog>
    );
};
