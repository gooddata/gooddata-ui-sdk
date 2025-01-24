// (C) 2020-2025 GoodData Corporation
import React from "react";
import { RichText } from "@gooddata/sdk-ui-kit";
import { IDashboardRichTextProps } from "./types.js";

export const ExportModeDashboardRichText: React.FC<IDashboardRichTextProps> = ({ widget, exportData }) => {
    return (
        <div {...exportData}>
            <RichText className="gd-rich-text-widget" value={widget?.content} renderMode="view" />
        </div>
    );
};
