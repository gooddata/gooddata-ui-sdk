// (C) 2026 GoodData Corporation

type ProblemError = { response?: { data?: { detail?: unknown } }; cause?: unknown };

// An API rejection carries the actionable reason in the problem `detail` field, while the
// surrounding AxiosError message only names the status code. The authenticated call converts
// the AxiosError to a backend error and keeps the original as its cause.
export const getApiProblemDetail = (error: unknown): string | undefined => {
    const problemError = error as ProblemError | undefined;
    const detail =
        problemError?.response?.data?.detail ?? (problemError?.cause as ProblemError)?.response?.data?.detail;
    return typeof detail === "string" && detail.trim() !== "" ? detail : undefined;
};

export const getDataSourceErrorMessage = (error: unknown): string => {
    const detail = getApiProblemDetail(error);
    if (detail !== undefined) {
        return detail;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
};
