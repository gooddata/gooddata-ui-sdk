// (C) 2020 GoodData Corporation

import React, { useState } from "react";
import { Button, ExportDialog } from "@gooddata/sdk-ui-kit";
import { ThemeProvider, useThemeIsLoading } from "@gooddata/sdk-ui-theme-provider";
import { newPositiveAttributeFilter } from "@gooddata/sdk-model";
import { AttributeFilter } from "@gooddata/sdk-ui-filters";
import { BarChart } from "@gooddata/sdk-ui-charts";

import { DateFilterComponentExample } from "../dateFilter/DateFilterComponentExample";
import { Ldm, LdmExt } from "../../ldm";
import { customTheme } from "../../constants/customTheme";

const style = {
    color: "var(--gd-palette-complementary-8, #464e56)",
    backgroundColor: "var(--gd-palette-complementary-0, #fff)",
};

export const ThemeProviderExample: React.FC = () => {
    return (
        <div className="s-theme-provider" style={style}>
            <ThemeProvider theme={customTheme}>
                <ThemedComponentsExample />
            </ThemeProvider>
        </div>
    );
};

const ThemedComponentsExample: React.FC = () => {
    const themeIsLoading = useThemeIsLoading();
    const [showExportDialog, setShowExportDialog] = useState(false);
    return (
        <div className="s-themed-components">
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
                        filter={newPositiveAttributeFilter(Ldm.EmployeeName.Default, ["Abbie Adams"])}
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
                        <BarChart measures={[LdmExt.TotalSales1]} viewBy={Ldm.LocationResort} />
                    </div>
                </div>
            )}
        </div>
    );
};
