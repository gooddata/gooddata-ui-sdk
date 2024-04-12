// (C) 2023-2024 GoodData Corporation
import {
    IExportDefinition,
    exportDefinitionUpdated,
    exportDefinitionCreated,
    exportDefinitionTitle,
} from "@gooddata/sdk-model";

const exportDefinitionDate = (exportDefinition: IExportDefinition) =>
    exportDefinitionUpdated(exportDefinition) ?? exportDefinitionCreated(exportDefinition) ?? "";

const compareCaseInsensitive = (a: string, b: string) =>
    a.localeCompare(b, undefined, { sensitivity: "base" });

const compareDatesDesc = (exportDefinitionA: IExportDefinition, exportDefinitionB: IExportDefinition) =>
    compareCaseInsensitive(exportDefinitionDate(exportDefinitionB), exportDefinitionDate(exportDefinitionA));

const compareTitlesAsc = (exportDefinitionA: IExportDefinition, exportDefinitionB: IExportDefinition) =>
    compareCaseInsensitive(
        exportDefinitionTitle(exportDefinitionA),
        exportDefinitionTitle(exportDefinitionB),
    );

export const exportDefinitionsListComparator = (
    exportDefinitionA: IExportDefinition,
    exportDefinitionB: IExportDefinition,
) =>
    compareDatesDesc(exportDefinitionA, exportDefinitionB) ||
    compareTitlesAsc(exportDefinitionA, exportDefinitionB);
