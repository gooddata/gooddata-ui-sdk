// (C) 2020 GoodData Corporation

import React, { useState } from "react";
import { Button, ExportDialog } from "@gooddata/sdk-ui-kit";
import { ThemeProvider, useTheme, useThemeIsLoading } from "@gooddata/sdk-ui-theme-provider";
import { newPositiveAttributeFilter } from "@gooddata/sdk-model";
import { AttributeFilter } from "@gooddata/sdk-ui-filters";
import { BarChart } from "@gooddata/sdk-ui-charts";

import { DateFilterComponentExample } from "../dateFilter/DateFilterComponentExample";
import { Md, MdExt } from "../../md";
import { customTheme } from "../../constants/customTheme";

export const ThemeProviderExample: React.FC = () => {
    return (
        <ThemeProvider theme={customTheme}>
            <ThemedComponentsExample />
        </ThemeProvider>
    );
};

const ThemedComponentsExample: React.FC = () => {
    const themeIsLoading = useThemeIsLoading();
    const theme = useTheme();

    const style = {
        color: theme?.palette?.complementary?.c8 ?? "#464e56",
        backgroundColor: theme?.palette?.complementary?.c0 ?? "#fff",
    };

    const [showExportDialog, setShowExportDialog] = useState(false);
    return (
        <div className="s-themed-components" style={style}>
            {themeIsLoading ? (
                <div>...</div>
            ) : (
                <div>
                    <pre>{JSON.stringify(customTheme, null, "  ")}</pre>
                    <br />
                    Button
                    <br />
                    <Button className="gd-button-action" value="Themed button" />
                    <br />
                    <br />
                    AttributeFilter
                    <br />
                    <AttributeFilter
                        filter={newPositiveAttributeFilter(Md.EmployeeName.Default, ["Abbie Adams"])}
                        onApply={() => {
                            /* omitted for brevity */
                        }}
                    />
                    <br />
                    <br />
                    DateFilter
                    <br />
                    <DateFilterComponentExample />
                    <br />
                    <br />
                    ExportDialog
                    <br />
                    <Button
                        className="gd-button-secondary"
                        onClick={() => {
                            setShowExportDialog(true);
                        }}
                        value={"Open Export Dialog"}
                    />
                    {showExportDialog && (
                        <ExportDialog
                            headline="Export to XLSX"
                            cancelButtonText="Cancel"
                            submitButtonText="Export"
                            isPositive
                            className="s-dialog"
                            mergeHeaders
                            mergeHeadersDisabled={false}
                            mergeHeadersText="Keep attribute cells merged"
                            mergeHeadersTitle="CELLS"
                            onCancel={() => {
                                setShowExportDialog(false);
                            }}
                            onSubmit={() => {
                                setShowExportDialog(false);
                            }}
                        />
                    )}
                    <br />
                    <br />
                    Bar chart
                    <br />
                    <div style={{ height: 300 }}>
                        <BarChart measures={[MdExt.TotalSales1]} viewBy={Md.LocationResort} />
                    </div>
                </div>
            )}
        </div>
    );
};
