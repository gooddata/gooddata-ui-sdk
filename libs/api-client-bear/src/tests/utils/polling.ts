// (C) 2007-2020 GoodData Corporation
import "isomorphic-fetch";
import fetchMock from "fetch-mock";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function mockPollingRequest(uri: string, pendingResponse: any, finalResponse: any): void {
    let counter = 0;
    fetchMock.mock(uri, () => {
        counter += 1;
        const response = counter > 3 ? finalResponse : pendingResponse;
        return {
            status: 200,
            body: JSON.stringify(response),
        };
    });
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function mockPollingRequestWithStatus(uri: string, pendingResponse: any, finalResponse: any): void {
    let counter = 0;
    fetchMock.mock(uri, () => {
        counter += 1;
        const response = counter > 3 ? finalResponse : pendingResponse;
        return {
            status: response.status,
            body: JSON.stringify(response),
        };
    });
}
