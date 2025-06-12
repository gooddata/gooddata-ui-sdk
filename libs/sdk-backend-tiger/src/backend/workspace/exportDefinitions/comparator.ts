// (C) 2023-2024 GoodData Corporation
import {
    IExportDefinitionMetadataObject,
    exportDefinitionUpdated,
    exportDefinitionCreated,
    exportDefinitionTitle,
} from "@gooddata/sdk-model";

const exportDefinitionDate = (exportDefinition: IExportDefinitionMetadataObject) =>
    exportDefinitionUpdated(exportDefinition) ?? exportDefinitionCreated(exportDefinition) ?? "";

const compareCaseInsensitive = (a: string, b: string) =>
    a.localeCompare(b, undefined, { sensitivity: "base" });

const compareDatesDesc = (
    exportDefinitionA: IExportDefinitionMetadataObject,
    exportDefinitionB: IExportDefinitionMetadataObject,
) => compareCaseInsensitive(exportDefinitionDate(exportDefinitionB), exportDefinitionDate(exportDefinitionA));

const compareTitlesAsc = (
    exportDefinitionA: IExportDefinitionMetadataObject,
    exportDefinitionB: IExportDefinitionMetadataObject,
) =>
    compareCaseInsensitive(
        exportDefinitionTitle(exportDefinitionA),
        exportDefinitionTitle(exportDefinitionB),
    );

export const exportDefinitionsListComparator = (
    exportDefinitionA: IExportDefinitionMetadataObject,
    exportDefinitionB: IExportDefinitionMetadataObject,
) =>
    compareDatesDesc(exportDefinitionA, exportDefinitionB) ||
    compareTitlesAsc(exportDefinitionA, exportDefinitionB);
