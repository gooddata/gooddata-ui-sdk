// (C) 2007-2020 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import isNil from "lodash/isNil";
import isObject from "lodash/isObject";
import omitBy from "lodash/fp/omitBy";
import { delay } from "./utils/promise";
import { ApiResponse, ApiResponseError } from "./xhr";

/**
 * Omit nil or empty object/array values of the object. Keep booleans & numbers.
 * Checks only first level object properties, does not check it recursively.
 */
export const omitEmpty = omitBy((val) => {
    if (isNil(val)) {
        return true;
    } else if (isObject(val)) {
        return isEmpty(val);
    }

    return false;
});

/**
 * Utility methods. Mostly private
 *
 *
 */

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getQueryEntries = (obj: any): any => {
    return obj?.query?.entries;
};

export interface IPollingOptions {
    attempts?: number;
    maxAttempts?: number;
    pollStep?: number;
}

/**
 * Helper for polling
 *
 * @param xhrRequest - xhr module
 * @param uri - URI to poll
 * @param isPollingDone - function determining whether the polling is finished
 * @param options - for polling (maxAttempts, pollStep)
 * @internal
 */
export const handlePolling = (
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    xhrRequest: any,
    uri: string,
    isPollingDone: (response: any) => boolean,
    options: IPollingOptions = {},
): Promise<any> => {
    // TODO
    const { attempts = 0, maxAttempts = 50, pollStep = 5000 } = options;

    return xhrRequest(uri)
        .then((r: any) => r.getData())
        .then((response: any) => {
            if (attempts > maxAttempts) {
                return Promise.reject(new Error(response));
            }
            return isPollingDone(response)
                ? Promise.resolve(response)
                : delay(pollStep).then(() => {
                      return handlePolling(xhrRequest, uri, isPollingDone, {
                          ...options,
                          attempts: attempts + 1,
                      });
                  });
        });
};

/**
 * Helper for polling with header status
 *
 * @param xhrRequest - xhr module
 * @param uri - URI to poll
 * @param isPollingDone - function determining whether the polling is finished
 * @param options - for polling (maxAttempts, pollStep)
 * @internal
 */
export const handleHeadPolling = (
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    xhrRequest: any,
    uri: string,
    isPollingDone: (responseHeaders: Response, response: ApiResponse) => boolean,
    options: IPollingOptions = {},
): Promise<any> => {
    const { attempts = 0, maxAttempts = 50, pollStep = 5000 } = options;

    return xhrRequest(uri).then((response: any) => {
        if (attempts > maxAttempts) {
            return Promise.reject(new Error("Export timeout!!!"));
        }
        const responseHeaders = response.getHeaders();
        if (isPollingDone(responseHeaders, response)) {
            if (responseHeaders.status === 200) {
                return Promise.resolve({ uri });
            }
            return Promise.reject(new ApiResponseError(response.statusText, response, response.getData()));
        } else {
            return delay(pollStep).then(() =>
                handleHeadPolling(xhrRequest, uri, isPollingDone, {
                    ...options,
                    attempts: attempts + 1,
                }),
            );
        }
    });
};

const REG_URI_OBJ = /\/gdc\/md\/(\S+)\/obj\/\d+/;

/**
 * Tests whether the provided string looks like a URI of a metadata object on GoodData platform
 *
 * @param value - string to test
 * @public
 */
export const isUri = (value: string): boolean => REG_URI_OBJ.test(value);

/**
 * Builds query string from plain object
 * (Refactored from admin/routes.js)
 *
 * @param query - parameters possibly including arrays inside
 * @returns querystring
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function queryString(query: any): string {
    function getSingleParam(key: string, value: string) {
        return Array.isArray(value)
            ? value.map((item) => `${encodeURIComponent(key)}=${encodeURIComponent(item)}`).join("&")
            : `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    }

    return query
        ? `?${Object.keys(query)
              .map((k) => getSingleParam(k, query[k]))
              .join("&")}`
        : "";
}

/**
 * Get all results from paged api by traversing all resulting pages
 * This is usable for apis which support offset and limit (i.e. not those with next paging links)
 *
 * @param xhrGet - xhr module
 * @param uri - uri to be fetched, will append offset and limit for next pages
 * @param itemKey - key under which to look for results (differs for different apis)
 * @param optional - offset starting offset, default 0
 * @param pagesData - optional data to be pre-filled
 */
export function getAllPagesByOffsetLimit(
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    xhr: any,
    uri: string,
    itemKey: string,
    offset: number = 0,
    pagesData: any[] = [],
): Promise<any> {
    const PAGE_LIMIT = 100;
    return new Promise((resolve: any, reject: any) => {
        xhr.get(`${uri}?offset=${offset}&limit=${PAGE_LIMIT}`)
            .then((r: any) => r.getData())
            .then((dataObjects: any) => {
                const projects = dataObjects?.[itemKey];
                const data = pagesData.concat(projects.items);

                const totalCount = projects?.paging?.totalCount ?? 0;
                const nextPage = offset + PAGE_LIMIT;
                if (nextPage > totalCount) {
                    resolve(data);
                } else {
                    resolve(getAllPagesByOffsetLimit(xhr, uri, itemKey, nextPage, data));
                }
            }, reject);
    });
}

// Parses string values to boolean, number and string
export const parseSettingItemValue = (value: string): boolean | number | string => {
    if (value === "true") {
        return true;
    }
    if (value === "false") {
        return false;
    }
    const nr = Number(value);
    if (nr.toString() === value) {
        return nr;
    }
    return value;
};
