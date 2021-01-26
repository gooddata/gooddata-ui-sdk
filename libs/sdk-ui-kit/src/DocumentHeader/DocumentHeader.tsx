// (C) 2007-2020 GoodData Corporation
import React from "react";
import DocumentTitle from "react-document-title";
import AppleTouchIcon from "./AppleTouchIcon";
import Favicon from "./Favicon";

/**
 * @internal
 */
export interface IDocumentHeaderProps {
    pageTitle?: string;
    brandTitle?: string;
    appleTouchIconUrl?: string;
    faviconUrl?: string;
}

/**
 * @internal
 */
const DocumentHeader: React.FC<IDocumentHeaderProps> = (props) => {
    const { pageTitle = "", brandTitle = "", appleTouchIconUrl = "", faviconUrl = "" } = props;

    let title: string;
    if (brandTitle) {
        if (pageTitle) {
            title = `${pageTitle} - ${brandTitle}`;
        } else {
            title = brandTitle;
        }
    } else {
        title = pageTitle;
    }

    return (
        <div>
            <DocumentTitle title={title} />
            <AppleTouchIcon url={appleTouchIconUrl} />
            <Favicon url={faviconUrl} />
        </div>
    );
};

export default DocumentHeader;
