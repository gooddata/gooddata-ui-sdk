// (C) 2021 GoodData Corporation
import React from "react";
import { DefaultShareDialogInner } from "./DefaultShareDialogInner";
import { ShareDialogPropsProvider } from "./ShareDialogPropsContext";
import { IShareDialogProps } from "./types";

/**
 * @alpha
 */
export const DefaultShareDialog = (props: IShareDialogProps): JSX.Element => {
    return (
        <ShareDialogPropsProvider {...props}>
            <DefaultShareDialogInner />
        </ShareDialogPropsProvider>
    );
};
