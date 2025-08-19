// (C) 2019-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { GoodDataSdkError, UnexpectedSdkError } from "../../errors/GoodDataSdkError.js";
import { UseCancelablePromiseState, UseCancelablePromiseStatus } from "../useCancelablePromise.js";
import {
    resolveUseCancelablePromisesError,
    resolveUseCancelablePromisesStatus,
} from "../useCancelablePromiseUtils.js";

const pendingState: UseCancelablePromiseState<unknown, GoodDataSdkError> = {
    status: "pending",
    result: undefined,
    error: undefined,
};

const loadingState: UseCancelablePromiseState<unknown, GoodDataSdkError> = {
    status: "loading",
    result: undefined,
    error: undefined,
};

const errorState: UseCancelablePromiseState<unknown, GoodDataSdkError> = {
    status: "error",
    result: undefined,
    error: new UnexpectedSdkError(),
};

const successState: UseCancelablePromiseState<unknown, GoodDataSdkError> = {
    status: "success",
    result: true,
    error: undefined,
};

describe("useCancelablePromiseUtils", () => {
    describe("resolveUseCancelablePromisesStatus - serial", () => {
        type Scenario = [
            scenarioName: string,
            expectedResult: UseCancelablePromiseStatus,
            statuses: UseCancelablePromiseState<unknown, unknown>[],
        ];

        const scenarios: Scenario[] = [
            ["short-cirtcuit to the first state, when it's pending", "pending", [pendingState, successState]],
            ["short-cirtcuit to the first state, when it's loading", "loading", [loadingState, successState]],
            ["short-cirtcuit to the first state, when it's error", "error", [errorState, successState]],
            [
                "continue to the second state, when first state is success",
                "pending",
                [successState, pendingState],
            ],
            [
                "continue to the second state, when first state is success",
                "loading",
                [successState, loadingState],
            ],
            [
                "continue to the second state, when first state is success",
                "error",
                [successState, errorState],
            ],
            ["return success, when all states are success", "success", [successState, successState]],
            ["handle also single state", "success", [successState]],
        ];

        it.each(scenarios)("should %s", (_, expectedResult, statuses) => {
            expect(resolveUseCancelablePromisesStatus(statuses)).toBe(expectedResult);
        });
    });

    describe("resolveUseCancelablePromisesStatus - parallel", () => {
        type Scenario = [
            scenarioName: string,
            expectedResult: UseCancelablePromiseStatus,
            statuses: UseCancelablePromiseState<unknown, unknown>[],
        ];

        const scenarios: Scenario[] = [
            ["when any state is pending", "pending", [successState, pendingState]],
            ["when any state is loading", "loading", [successState, loadingState]],
            ["when any state is error", "error", [successState, errorState]],
            ["when all states are success", "success", [successState, successState]],
            ["for single state success", "success", [successState]],
        ];

        it.each(scenarios)("%s should return status: %s", (_, expectedResult, statuses) => {
            expect(resolveUseCancelablePromisesStatus(statuses, { strategy: "parallel" })).toBe(
                expectedResult,
            );
        });
    });

    describe("resolveUseCancelablePromisesError", () => {
        type Scenario = [
            scenarioName: string,
            expectedResult: GoodDataSdkError | undefined,
            statuses: UseCancelablePromiseState<unknown, unknown>[],
        ];

        const scenarios: Scenario[] = [
            ["should return first error", errorState.error, [successState, errorState]],
            [
                "should return undefined when error state is not present",
                undefined,
                [successState, pendingState, loadingState],
            ],
        ];

        it.each(scenarios)("%s", (_, expectedResult, errors) => {
            expect(resolveUseCancelablePromisesError(errors)).toBe(expectedResult);
        });
    });
});
