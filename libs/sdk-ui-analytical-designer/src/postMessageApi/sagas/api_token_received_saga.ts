// (C) 2020-2026 GoodData Corporation

import { call, put, select } from "redux-saga/effects";

import { type AdSetApiTokenCommandData } from "@gooddata/sdk-embedding";

import {
    type IApiToken,
    isHostBackendAdopted,
    isValidApiTokenType,
    reinitializeBackend,
    setApiTokenHandler,
    setJwtHandler,
} from "../../backend.js";
import { backendInitialized } from "../../sagas/application_context/application_context_actions.js";
import { storeApiToken } from "../../store/application_context/app_context_actions.js";
import { selectApiToken, selectApiTokenType } from "../../store/application_context/app_context_selector.js";
import { getExternalProviderIdParam } from "../../utils/location.js";
import { postInvalidCommandArgument } from "../outgoing/invalid_command_events.js";

import { getPostMessageContextIdFromCommandData } from "./post_message_saga_helper.js";

const DEFAULT_TOKEN_TYPE = "gooddata";

const isValidToken = (token: string, type: string) =>
    token !== undefined && token.length > 0 && (type !== "jwt" || /^[\w-]+\.[\w-]+\.[\w-]+$/.test(token));

export function* handleReceivedApiToken(setApiTokenContext: AdSetApiTokenCommandData) {
    const contextId = getPostMessageContextIdFromCommandData(setApiTokenContext);
    const {
        token,
        type = DEFAULT_TOKEN_TYPE,
        secondsBeforeTokenExpirationToEmitReminder = 60,
    } = setApiTokenContext.gdc.event.data;

    const apiToken: IApiToken = {
        apiToken: token,
        apiTokenType: type,
        secondsBeforeTokenExpirationToCallReminder: secondsBeforeTokenExpirationToEmitReminder,
    };

    const previousTokenType: ReturnType<typeof selectApiTokenType> = yield select(selectApiTokenType);

    if (!isValidToken(token, type)) {
        yield call(postInvalidCommandArgument, "Token is not provided or has invalid format.", contextId);
        return;
    } else if (!isValidApiTokenType(type)) {
        yield call(postInvalidCommandArgument, "The provided token type is not supported.", contextId);
        return;
    } else if (previousTokenType !== undefined && previousTokenType !== type) {
        yield call(postInvalidCommandArgument, "Token type is not same as the previous one.", contextId);
        return;
    }

    const previousToken: ReturnType<typeof selectApiToken> = yield select(selectApiToken);

    if (previousToken === undefined) {
        yield call(initializeBackendForTheFirstTime, apiToken);
    } else if (type === "gooddata") {
        yield call(updateApiTokenValue, apiToken);
    } else if (type === "jwt") {
        yield call(updateJwtValue, apiToken, contextId);
    }
}

function* initializeBackendForTheFirstTime(apiToken: IApiToken) {
    // A host-adopted backend must never be replaced from here — the host's provider already
    // authenticates; only record the token (components like the metric editor read it).
    if (!isHostBackendAdopted) {
        const externalProviderId: ReturnType<typeof getExternalProviderIdParam> =
            yield call(getExternalProviderIdParam);
        yield call(reinitializeBackend, apiToken, externalProviderId);
    }
    yield put(storeApiToken(apiToken.apiToken, apiToken.apiTokenType));
    yield put(backendInitialized());
}

function* updateApiTokenValue({ apiToken: token, apiTokenType }: IApiToken) {
    // No handler means there is no AD-side auth provider (host-adopted backend) — the host has
    // already renewed its provider in place; only keep the stored token in sync.
    if (setApiTokenHandler) {
        setApiTokenHandler(token);

        // oxlint-disable-next-line eslint-js/no-console
        console.log("Using new Tiger API Token for authentication");
    }

    yield put(storeApiToken(token, apiTokenType));
}

function* updateJwtValue(apiToken: IApiToken, contextId: string) {
    const { apiToken: token, apiTokenType, secondsBeforeTokenExpirationToCallReminder } = apiToken;
    try {
        // No handler means there is no AD-side auth provider (host-adopted backend) — the host has
        // already renewed its provider in place; only keep the stored token in sync.
        if (setJwtHandler) {
            // set token to backend instance via callback we received from the expiration reminder
            setJwtHandler(token, secondsBeforeTokenExpirationToCallReminder);

            // oxlint-disable-next-line eslint-js/no-console
            console.log("Using new JWT for authentication");
        }

        yield put(storeApiToken(token, apiTokenType));
    } catch (error) {
        // oxlint-disable-next-line eslint-js/no-console
        console.log(error);
        yield call(postInvalidCommandArgument, "JWT is not for the same sub as the previous one.", contextId);
    }
}
