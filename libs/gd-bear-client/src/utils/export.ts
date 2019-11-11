// (C) 2007-2019 GoodData Corporation
import { SUCCESS_REQUEST_STATUS, BAD_REQUEST_STATUS } from "../constants/errors";

export function isExportFinished(responseHeaders: Response): boolean {
    const taskState = responseHeaders.status;
    return taskState === SUCCESS_REQUEST_STATUS || taskState >= BAD_REQUEST_STATUS; // OK || ERROR
}
