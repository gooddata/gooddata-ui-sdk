// (C) 2020 GoodData Corporation
import React from "react";
import { ShareDialog } from "@gooddata/sdk-ui-kit";
import { IShareDialogProps } from "./types";

/**
 * @alpha
 */
export const DefaultShareDialog = (props: IShareDialogProps): JSX.Element | null => {
    const { isVisible, sharedObject, currentUserRef, onApply, onCancel } = props;

    if (!isVisible) {
        return null;
    }

    return (
        <ShareDialog
            sharedObject={sharedObject}
            currentUserRef={currentUserRef}
            onApply={onApply}
            onCancel={onCancel}
        />
    );
};
