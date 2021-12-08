// (C) 2019-2021 GoodData Corporation

import { customBackend } from "../index";
import {
    IAuthenticatedPrincipal,
    IAuthenticationContext,
    IAuthenticationProvider,
    IDataView,
    IExecutionResult,
    NotAuthenticated,
} from "@gooddata/sdk-backend-spi";
import { dummyDataView } from "../../dummyBackend";
import { ReferenceMd } from "@gooddata/reference-workspace";
import { newDefForItems } from "@gooddata/sdk-model";
import { AnonymousAuthProvider } from "../../toolkit/auth";
import {
    ApiClientProvider,
    CustomBackendConfig,
    DataProvider,
    DataProviderContext,
    ResultProvider,
    ResultProviderContext,
} from "../config";

function client(): ApiClientProvider {
    let i = 1;

    return (_config: CustomBackendConfig) => {
        return {
            cliendId: i++,
        };
    };
}

function resultProviderUsingFactory(context: ResultProviderContext): Promise<IExecutionResult> {
    return Promise.resolve(context.resultFactory([], "testResult"));
}

function resultThatFirstFailsDueToNoAuth(): ResultProvider {
    let noAuth = true;

    return (context: ResultProviderContext): Promise<IExecutionResult> => {
        if (noAuth) {
            noAuth = false;
            throw new NotAuthenticated("access denied");
        }
        const dummyView = dummyDataView(context.execution.definition);

        return Promise.resolve(dummyView.result);
    };
}

function emptyDataProvider(context: DataProviderContext): Promise<IDataView> {
    const dummyView = dummyDataView(context.result.definition);

    return Promise.resolve(dummyView);
}

function createBackend(
    resultProvider: ResultProvider = resultProviderUsingFactory,
    dataProvider: DataProvider = emptyDataProvider,
) {
    const mockClientProvider = jest.fn(client());
    const mockResultProvider = jest.fn(resultProvider);
    const mockDataProvider = jest.fn(dataProvider);

    const backend = customBackend({
        clientProvider: mockClientProvider,
        resultProvider: mockResultProvider,
        dataProvider: mockDataProvider,
    });

    return {
        backend,
        mockClientProvider,
        mockResultProvider,
        mockDataProvider,
    };
}

function createAuthenticationProvider(
    authMethod?: (ctx: IAuthenticationContext) => Promise<IAuthenticatedPrincipal>,
) {
    const anonymouse = new AnonymousAuthProvider();
    const mockGetCurrentPrincipal = jest.fn(anonymouse.getCurrentPrincipal);
    const mockDeauthenticate = jest.fn(anonymouse.deauthenticate);
    const mockAuthenticate = jest.fn(authMethod || anonymouse.authenticate);

    const provider: IAuthenticationProvider = {
        authenticate: mockAuthenticate,
        deauthenticate: mockDeauthenticate,
        getCurrentPrincipal: mockGetCurrentPrincipal,
    };

    return {
        provider,
        mockAuthenticate,
        mockDeauthenticate,
        mockGetCurrentPrincipal,
    };
}

//
//
//

describe("custom backend", () => {
    const TestDefinition = newDefForItems("test", [ReferenceMd.Won, ReferenceMd.Amount]);

    describe("result and data provider integration", () => {
        it("should dispatch execution to resultProvider", async () => {
            const { backend, mockResultProvider } = createBackend();

            const result = await backend
                .workspace("test")
                .execution()
                .forDefinition(TestDefinition)
                .execute();

            expect(result.definition).toEqual(TestDefinition);
            expect(mockResultProvider).toBeCalledTimes(1);
        });

        it("should dispatch readAll to dataProvider", async () => {
            const { backend, mockDataProvider } = createBackend();

            const result = await backend
                .workspace("test")
                .execution()
                .forDefinition(TestDefinition)
                .execute();

            await result.readAll();

            expect(mockDataProvider).toBeCalledTimes(1);
        });

        it("should dispatch readWindow to dataProvider with window in context", async () => {
            const { backend, mockDataProvider } = createBackend();

            const result = await backend
                .workspace("test")
                .execution()
                .forDefinition(TestDefinition)
                .execute();

            await result.readWindow([1, 1], [100, 100]);

            expect(mockDataProvider).toBeCalledTimes(1);
            expect(mockDataProvider).toBeCalledWith(
                expect.objectContaining({
                    window: {
                        offset: [1, 1],
                        size: [100, 100],
                    },
                }),
            );
        });
    });

    describe("client provider integration", () => {
        it("should be called once during execution", async () => {
            const { backend, mockClientProvider } = createBackend();

            await backend.workspace("test").execution().forDefinition(TestDefinition).execute();

            expect(mockClientProvider).toBeCalledTimes(1);
        });

        it("should be called twice when executing and then reading data", async () => {
            const { backend, mockClientProvider } = createBackend();

            const result = await backend
                .workspace("test")
                .execution()
                .forDefinition(TestDefinition)
                .execute();

            await result.readAll();

            expect(mockClientProvider).toBeCalledTimes(2);
        });

        it("should be called once during execution that involves authentication", async () => {
            /*
             * This verifies that the entire auth-guarded-flow uses single instance of client.
             */
            const { backend, mockClientProvider } = createBackend(resultThatFirstFailsDueToNoAuth());

            await backend.workspace("test").execution().forDefinition(TestDefinition).execute();

            expect(mockClientProvider).toBeCalledTimes(1);
        });
    });

    describe("authentication", () => {
        it("should not authenticate when resultProvider does not throw", async () => {
            const { provider, mockAuthenticate } = createAuthenticationProvider();
            const { backend } = createBackend();

            await backend
                .withAuthentication(provider)
                .workspace("test")
                .execution()
                .forDefinition(TestDefinition)
                .execute();

            expect(mockAuthenticate).toBeCalledTimes(0);
        });

        it("should trigger authenticate when NotAuthenticated raised by resultProvider", async () => {
            const { provider, mockAuthenticate } = createAuthenticationProvider();
            const { backend } = createBackend(resultThatFirstFailsDueToNoAuth());

            await backend
                .withAuthentication(provider)
                .workspace("test")
                .execution()
                .forDefinition(TestDefinition)
                .execute();

            expect(mockAuthenticate).toBeCalledTimes(1);
        });
    });
});
