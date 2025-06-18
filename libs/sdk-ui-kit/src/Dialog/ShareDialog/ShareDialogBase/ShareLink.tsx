// (C) 2025 GoodData Corporation

import React, { useCallback, useMemo } from "react";
import { Input } from "../../../Form/index.js";
import { Typography } from "../../../Typography/index.js";
import { compressForUrl } from "@gooddata/sdk-ui";
import { IShareLinkProps } from "./types.js";

/**
 * @internal
 */
export const ShareLink: React.FC<IShareLinkProps> = ({
    dashboardFilters,
    headline,
    helperText,
    buttonText,
    onShareLinkCopy,
}) => {
    const shareLink = useMemo(() => {
        const filters = { filters: compressForUrl(dashboardFilters ?? []) };
        const url = window.location.origin;
        const hashLocation = window.location.hash.split("?")[0];
        return url
            .concat("/dashboards/")
            .concat(hashLocation)
            .concat(`?${new URLSearchParams(filters).toString()}`);
    }, [dashboardFilters]);

    const onIconButtonClick = useCallback(() => {
        onShareLinkCopy?.(shareLink);
    }, [shareLink, onShareLinkCopy]);

    return (
        <>
            <div className="gd-share-dialog-grantee-content-header">
                <Typography tagName="h3">{headline}</Typography>
            </div>
            <Input
                value={shareLink}
                readonly={true}
                iconButton="copy"
                onIconButtonClick={onIconButtonClick}
                iconButtonLabel={buttonText}
            />
            <div className="gd-share-dialog-share-link-helper-text">{helperText}</div>
        </>
    );
};
