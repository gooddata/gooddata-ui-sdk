// Copyright (C) 2007-2017, GoodData(R) Corporation. All rights reserved.
import { createModule as experimentalExecutionsFactory } from './execution/experimental-executions';
import { createModule as loadAttributesMapFactory } from './utils/attributesMapLoader';
import { createModule as executeAfmFactory } from './execution/execute-afm';

/**
 * Execution endpoints
 *
 * @module execution
 * @class execution
 *
 */
export function createModule(xhr, md) {
    const loadAttributesMap = loadAttributesMapFactory(md);
    const {
        getData,
        mdToExecutionDefinitionsAndColumns
    } = experimentalExecutionsFactory(xhr, loadAttributesMap);
    return {
        getData,
        mdToExecutionDefinitionsAndColumns,
        executeAfm: executeAfmFactory(xhr)
    };
}
