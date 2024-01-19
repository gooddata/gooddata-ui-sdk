// (C) 2020-2024 GoodData Corporation
import React from "react";
import { IDashboardRichTextProps } from "./types.js";
import { RichText } from "../richText/RichText.js";

/**
 * @internal
 */
export const ViewModeDashboardRichText: React.FC<IDashboardRichTextProps> = ({ widget }) => {
    return <RichText text={widget?.content} />;
};
