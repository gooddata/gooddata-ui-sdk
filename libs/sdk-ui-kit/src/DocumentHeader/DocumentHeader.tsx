// (C) 2007-2020 GoodData Corporation
import React from "react";
import { Helmet } from "react-helmet";
import compact from "lodash/compact.js";

/**
 * @internal
 */
export interface IDocumentHeaderProps {
    pageTitle?: string;
    brandTitle?: string;
    appleTouchIconUrl?: string;
    faviconUrl?: string;
}

function getEffectiveTitle(pageTitle: string, brandTitle: string): string {
    return compact([pageTitle, brandTitle]).join(" - ");
}

/**
 * @internal
 */
const DocumentHeader: React.FC<IDocumentHeaderProps> = (props) => {
    const { pageTitle = "", brandTitle = "", appleTouchIconUrl = "", faviconUrl = "" } = props;

    return (
        <Helmet>
            <title>{getEffectiveTitle(pageTitle, brandTitle)}</title>
            <link rel="apple-touch-icon" type="image/png" href={appleTouchIconUrl} />
            <link rel="shortcut icon" type="image/x-icon" href={faviconUrl} />
        </Helmet>
    );
};

export default DocumentHeader;
