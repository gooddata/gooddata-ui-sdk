// (C) 2007-2018 GoodData Corporation
import "isomorphic-fetch";
import fetchMock from "fetch-mock";

export function mockPollingRequest(uri: string, pendingResponse: any, finalResponse: any) {
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

export function mockPollingRequestWithStatus(uri: string, pendingResponse: any, finalResponse: any) {
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
