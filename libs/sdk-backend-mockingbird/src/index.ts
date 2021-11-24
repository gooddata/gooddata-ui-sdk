// (C) 2019-2021 GoodData Corporation
/**
 * This package provides a mock Analytical Backend implementation used mainly for testing.
 *
 * @remarks
 * For the GoodData platform version, see `@gooddata/sdk-backend-bear`.
 * For the GoodData.CN version, see `@gooddata/sdk-backend-tiger`.
 *
 * @packageDocumentation
 */
import { dummyBackend, dummyBackendEmptyData, dummyDataView } from "@gooddata/sdk-backend-base";
export { dummyBackend, dummyBackendEmptyData, dummyDataView };

export { recordedBackend, defaultRecordedBackendCapabilities } from "./recordedBackend";

export {
    RecordingIndex,
    ExecutionRecording,
    InsightRecording,
    DisplayFormRecording,
    ScenarioRecording,
    RecordedBackendConfig,
    CatalogRecording,
    VisClassesRecording,
    DashboardRecording,
    RecordedRefType,
    SecuritySettingsUrlValidator,
    SecuritySettingsOrganizationScope,
    SecuritySettingsPluginUrlValidator,
    IUserGroup,
    IUsers,
    IAccessControl,
} from "./recordedBackend/types";

export {
    recordedDataView,
    recordedDataViews,
    recordedInsight,
    DataViewAll,
    dataViewWindow,
    DataViewFirstPage,
    NamedDataView,
} from "./recordedBackend/execution";

export { CompositeBackendPart, compositeBackend } from "./compositeBackend/index";

export {
    LegacyExecutionRecording,
    legacyRecordedBackend,
    legacyRecordedDataView,
    LegacyRecordingIndex,
    LegacyWorkspaceRecordings,
} from "./legacyRecordedBackend";

export { objRefsToStringKey } from "./recordedBackend/utils";
