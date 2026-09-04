// (C) 2019-2026 GoodData Corporation

import { type AxiosError, type AxiosResponse, isCancel } from "axios";

import {
    AbortError,
    type AnalyticalBackendError,
    ContractExpired,
    DataTooLargeError,
    LimitReached,
    NotAuthenticated,
    PermissionEscalationRefused,
    UnexpectedError,
    UnexpectedResponseError,
    isAnalyticalBackendError,
    isDataTooLargeError,
} from "@gooddata/sdk-backend-spi";

export function convertApiError(error: Error): AnalyticalBackendError {
    if (isAnalyticalBackendError(error)) {
        return error;
    }

    const notAuthenticated = createNotAuthenticatedError(error);
    if (notAuthenticated) {
        return notAuthenticated;
    }

    const limitReached = createLimitReachedError(error);
    if (limitReached) {
        return limitReached;
    }

    const contractExpired = createContractExpiredError(error);
    if (contractExpired) {
        return contractExpired;
    }

    const dataTooLarge = createDataTooLargeError(error);
    if (dataTooLarge) {
        return dataTooLarge;
    }

    const permissionEscalation = createPermissionEscalationRefusedError(error);
    if (permissionEscalation) {
        return permissionEscalation;
    }

    const unexpectedResponseError = createUnexpectedResponseError(error);
    if (unexpectedResponseError) {
        return unexpectedResponseError;
    }

    if (isCancel(error)) {
        return new AbortError("The request was cancelled");
    }

    return new UnexpectedError("An unexpected error has occurred", error);
}

export function createNotAuthenticatedError(error: Error): NotAuthenticated | undefined {
    const axiosErrorResponse = (error as AxiosError).response;

    if (axiosErrorResponse?.status !== 401) {
        return;
    }

    const exc = new NotAuthenticated("No session or session expired", error);

    // TODO: TIGER-HACK both of these params need to come from the backend.
    //  current problems:
    //  - some resources do not send login URL (empty 401), some do
    //  - no resources send returnRedirectParam
    exc.authenticationFlow = {
        loginUrl: "/appLogin",
        returnRedirectParam: "redirectTo",
    };

    return exc;
}

function createLimitReachedError(error: Error): LimitReached | undefined {
    const axiosErrorResponse = (error as AxiosError<any>).response;

    if (
        axiosErrorResponse?.status !== 400 ||
        !axiosErrorResponse.data?.detail?.includes("Reached plan limits")
    ) {
        return;
    }

    return new LimitReached("The limit reached. Upgrade your plan to create more objects.", error);
}

// Tiger reports a refused over-grant as a 400 whose detail names the level. Matching the
// detail is how this file classifies such responses (see the two creators around this one);
// it belongs here so UI packages can check a typed error instead of a backend's wording.
function createPermissionEscalationRefusedError(error: Error): PermissionEscalationRefused | undefined {
    const axiosErrorResponse = (error as AxiosError<any>).response;

    if (
        axiosErrorResponse?.status !== 400 ||
        !axiosErrorResponse.data?.detail?.includes("higher level than the current user's")
    ) {
        return;
    }

    return new PermissionEscalationRefused(
        "The change would grant a permission level the caller does not hold.",
        error,
    );
}

/**
 * Reasons the gateway's license/contract gate can deny a request with, carried in the 403 body's
 * `reason` field (`components/gateway/gateway-api-gw/.../LicenseGatekeeper.kt` `DenyReason.code` in
 * gdc-nas). Only the reasons a user can act on (or that block login entirely) are treated as a
 * contract-expired condition here; the remaining reasons stay unexpected errors.
 */
const CONTRACT_EXPIRED_REASONS = ["contract_expired", "license_expired"];

function createContractExpiredError(error: Error): ContractExpired | undefined {
    const axiosErrorResponse = (error as AxiosError<any>).response;

    if (axiosErrorResponse?.status !== 403) {
        return;
    }

    // Older gateways do not send `reason` and only ever deny profile/invite this way, so the legacy
    // detail-text match stays as a fallback rather than being replaced by the new field.
    const matchesReason = CONTRACT_EXPIRED_REASONS.includes(axiosErrorResponse.data?.reason);
    const matchesLegacyDetail =
        axiosErrorResponse.data?.detail?.includes("Contract expired") ||
        axiosErrorResponse.data?.detail?.includes("Reason: EXPIRED");

    if (!matchesReason && !matchesLegacyDetail) {
        return;
    }

    return new ContractExpired(axiosErrorResponse.data.tier || "unspecified", error);
}

function createDataTooLargeError(error: Error): DataTooLargeError | undefined {
    // Some call sites already throw this error in the correct form.
    if (isDataTooLargeError(error)) {
        return error;
    }

    const axiosErrorResponse = (error as AxiosError<any>).response;

    const isLimit =
        axiosErrorResponse?.data?.structuredDetail?.limitBreaks?.length ||
        axiosErrorResponse?.data?.detail?.includes("Reached limit of maximum data size");

    if (axiosErrorResponse?.status !== 400 || !isLimit) {
        return;
    }

    return new DataTooLargeError(axiosErrorResponse.data?.reason, error, axiosErrorResponse.data);
}

function createUnexpectedResponseError(error: Error): UnexpectedResponseError | undefined {
    const axiosErrorResponse = (error as AxiosError).response;
    if (!axiosErrorResponse) {
        return;
    }

    return new UnexpectedResponseError(
        error.message,
        axiosErrorResponse.status,
        axiosErrorResponse.data,
        getTraceId(axiosErrorResponse),
        error,
    );
}

function getTraceId(axiosErrorResponse: AxiosResponse): string | undefined {
    return axiosErrorResponse.headers?.["x-gdc-trace-id"];
}
