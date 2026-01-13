// (C) 2025-2026 GoodData Corporation

// Execution API
export {
    ActionsApi_ComputeReport as ExecutionAPI_ComputeReport,
    type ActionsApiComputeReportRequest as ExecutionAPIComputeReportRequest,
    ActionsApi_ChangeAnalysis as ExecutionAPI_ChangeAnalysis,
    type ActionsApiChangeAnalysisRequest as ExecutionAPIChangeAnalysisRequest,
} from "../../generated/afm-rest-api/index.js";

// Execution Result API
export {
    ActionsApi_RetrieveResult as ExecutionResultAPI_RetrieveResult,
    ActionsApi_ChangeAnalysisResult as ExecutionResultAPI_ChangeAnalysisResult,
    type ActionsApiChangeAnalysisResultRequest as ExecutionResultAPIChangeAnalysisResultRequest,
    type ActionsApiRetrieveResultRequest as ExecutionResultAPIRetrieveResultRequest,
} from "../../generated/afm-rest-api/index.js";
