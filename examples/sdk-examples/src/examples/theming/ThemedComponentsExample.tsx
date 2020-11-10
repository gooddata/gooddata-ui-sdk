// (C) 2020 GoodData Corporation

import React, { useState } from "react";
import { Button, ExportDialog } from "@gooddata/sdk-ui-kit";
import { ThemeProvider, useTheme, useThemeIsLoading } from "@gooddata/sdk-ui-theme-provider";
import { newPositiveAttributeFilter, newRankingFilter } from "@gooddata/sdk-model";
import { AttributeFilter, RankingFilter } from "@gooddata/sdk-ui-filters";

import { attributeDropdownItems, measureDropdownItems } from "../rankingFilter/RankingFilterExample";
import { DateFilterComponentExample } from "../dateFilter/DateFilterComponentExample";
import { Ldm, LdmExt } from "../../ldm";
import { customTheme } from "../../constants/customTheme";

export const ThemeProviderExample: React.FC = () => {
    return (
        <div className="s-theme-provider">
            <ThemeProvider theme={customTheme}>
                <ThemedComponentsExample />
            </ThemeProvider>
        </div>
    );
};

const ThemedComponentsExample: React.FC = () => {
    const theme = useTheme();
    const themeIsLoading = useThemeIsLoading();
    const [showExportDialog, setShowExportDialog] = useState(false);
    return (
        <div className="s-themed-components">
            {themeIsLoading ? (
                <div>...</div>
            ) : (
                <div>
                    <pre>{JSON.stringify(theme, null, "  ")}</pre>
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
                        onApply={() => {}}
                    />
                    <br />
                    <br />
                    RankingFilter
                    <br />
                    <RankingFilter
                        measureItems={measureDropdownItems}
                        attributeItems={attributeDropdownItems}
                        filter={newRankingFilter(LdmExt.franchiseSalesLocalId, "TOP", 3)}
                        onApply={() => {}}
                        buttonTitle={"Ranking filter configuration"}
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
                </div>
            )}
        </div>
    );
};
