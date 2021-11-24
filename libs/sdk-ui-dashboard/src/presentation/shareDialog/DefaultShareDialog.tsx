// (C) 2020 GoodData Corporation
import React from "react";
import { ShareDialog } from "@gooddata/sdk-ui-kit";
import { IShareDialogProps } from "./types";

/**
 * @alpha
 */
export const DefaultShareDialog = (props: IShareDialogProps): JSX.Element | null => {
    const { workspace, backend, isVisible, sharedObject, currentUserRef, onApply, onCancel, onError } = props;

    if (!isVisible) {
        return null;
    }

    return (
        <ShareDialog
            backend={backend}
            workspace={workspace}
            sharedObject={sharedObject}
            currentUserRef={currentUserRef}
            onApply={onApply}
            onCancel={onCancel}
            onError={onError}
        />
    );
};
