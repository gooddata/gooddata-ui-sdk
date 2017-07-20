import fetchMock from '../utils/fetch-mock';

export function mockPollingRequest(uri, pendingResponse, finalResponse) {
    let counter = 0;
    fetchMock.mock(
        uri,
        'GET',
        () => {
            counter += 1;
            const response = counter > 3 ? finalResponse : pendingResponse;
            return {
                status: 200,
                body: JSON.stringify(response)
            };
        }
    );
}
