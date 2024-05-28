// (C) 2020-2024 GoodData Corporation
import React from "react";
import { RichText } from "@gooddata/sdk-ui-kit";
import { IDashboardRichTextProps } from "./types.js";

/**
 * @internal
 */
export const ViewModeDashboardRichText: React.FC<IDashboardRichTextProps> = ({ widget }) => {
    return <RichText className="gd-rich-text-widget" value={widget?.content} renderMode="view" />;
};
