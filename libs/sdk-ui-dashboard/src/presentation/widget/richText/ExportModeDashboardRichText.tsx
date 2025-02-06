// (C) 2020-2025 GoodData Corporation
import React from "react";
import { RichText } from "@gooddata/sdk-ui-kit";

import { useVisualizationExportData } from "../../export/index.js";

import { IDashboardRichTextProps } from "./types.js";

export const ExportModeDashboardRichText: React.FC<IDashboardRichTextProps> = ({ widget, exportData }) => {
    const exportDataText = useVisualizationExportData(exportData, false, false);
    return (
        <div {...exportDataText}>
            <RichText className="gd-rich-text-widget" value={widget?.content} renderMode="view" />
        </div>
    );
};
