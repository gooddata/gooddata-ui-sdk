// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
import {
    isPlainObject,
    get as _get,
    chunk,
    flatten,
    pick
} from 'lodash';
import { getIn, handlePolling, queryString } from './util';

/**
 * Functions for working with metadata objects
 *
 * @class metadata
 * @module metadata
 */
export function createModule(xhr) {
    /**
     * Load all objects with given uris
     * (use bulk loading instead of getting objects one by one)
     *
     * @method getObjects
     * @param {String} projectId id of the project
     * @param {Array} objectUris array of uris for objects to be loaded
     * @return {Array} array of loaded elements
     */
    function getObjects(projectId, objectUris) {
        const LIMIT = 50;
        const uri = `/gdc/md/${projectId}/objects/get`;

        const objectsUrisChunks = chunk(objectUris, LIMIT);

        const promises = objectsUrisChunks.map((objectUrisChunk) => {
            const data = {
                get: {
                    items: objectUrisChunk
                }
            };

            return xhr.post(uri, {
                data: JSON.stringify(data)
            }).then((r) => {
                if (!r.ok) {
                    const err = new Error(r.statusText);
                    err.response = r;
                    throw err;
                }

                return r.json();
            }).then(result => _get(result, ['objects', 'items']));
        });

        return Promise.all(promises).then(flatten);
    }

    /**
     * Loads all objects by query (fetches all pages, one by one)
     *
     * @method getObjectsByQuery
     * @param {String} projectId id of the project
     * @param {Object} options (see https://developer.gooddata.com/api endpoint: /gdc/md/{project_id}/objects/query)
     *        - category {String} for example 'dataSets' or 'projectDashboard'
     *        - mode {String} 'enriched' or 'raw'
     *        - author {String} the URI of the author of the metadata objects
     *        - limit {number} default is 50 (also maximum)
     * @return {Promise<Array>} array of returned objects
     */
    function getObjectsByQuery(projectId, options) {
        function getOnePage(uri, items = []) {
            return xhr.get(uri)
                .then(({ objects }) => {
                    items.push(...objects.items);
                    const nextUri = objects.paging.next;
                    return nextUri ? getOnePage(nextUri, items) : items;
                });
        }

        const uri = `/gdc/md/${projectId}/objects/query`;
        const query = pick({ limit: 50, ...options }, ['category', 'mode', 'author', 'limit']);
        return getOnePage(uri + queryString(query));
    }

    /**
     * Get MD objects from using2 resource. Include only objects of given types
     * and take care about fetching only nearest objects if requested.
     *
     * @method getObjectUsing
     * @param {String} projectId id of the project
     * @param {String} uri uri of the object for which dependencies are to be found
     * @param {Object} options objects with options:
     *        - types {Array} array of strings with object types to be included
     *        - nearest {Boolean} whether to include only nearest dependencies
     * @return {jQuery promise} promise promise once resolved returns an array of
     *         entries returned by using2 resource
     */
    function getObjectUsing(projectId, uri, options = {}) {
        const { types = [], nearest = false } = options;
        const resourceUri = `/gdc/md/${projectId}/using2`;

        const data = {
            inUse: {
                uri,
                types,
                nearest: nearest ? 1 : 0
            }
        };

        return xhr.post(resourceUri, {
            data: JSON.stringify(data)
        }).then((r) => {
            if (!r.ok) {
                const err = new Error(r.statusText);
                err.response = r;
                throw err;
            }

            return r.json();
        }).then(result => result.entries);
    }

    /**
     * Get MD objects from using2 resource. Include only objects of given types
     * and take care about fetching only nearest objects if requested.
     *
     * @method getObjectUsingMany
     * @param {String} projectId id of the project
     * @param {Array} uris uris of objects for which dependencies are to be found
     * @param {Object} options objects with options:
     *        - types {Array} array of strings with object types to be included
     *        - nearest {Boolean} whether to include only nearest dependencies
     * @return {jQuery promise} promise promise once resolved returns an array of
     *         entries returned by using2 resource
     */
    function getObjectUsingMany(projectId, uris, options = {}) {
        const { types = [], nearest = false } = options;
        const resourceUri = `/gdc/md/${projectId}/using2`;

        const data = {
            inUseMany: {
                uris,
                types,
                nearest: nearest ? 1 : 0
            }
        };

        return xhr.post(resourceUri, {
            data: JSON.stringify(data)
        }).then((r) => {
            if (!r.ok) {
                const err = new Error(r.statusText);
                err.response = r;
                throw err;
            }

            return r.json();
        }).then(result => result.useMany);
    }

    /**
     * Returns all visualizations metadata in a project specified by projectId param
     *
     * @method getVisualizations
     * @param {string} projectId Project identifier
     * @return {Array} An array of visualization objects
     */
    function getVisualizations(projectId) {
        return xhr.get(`/gdc/md/${projectId}/query/visualizations`).then(r => (r.ok ? r.json() : r)).then(getIn('query.entries'));
    }

    /**
    * Returns all attributes in a project specified by projectId param
    *
    * @method getAttributes
    * @param {string} projectId Project identifier
    * @return {Array} An array of attribute objects
    */
    function getAttributes(projectId) {
        return xhr.get(`/gdc/md/${projectId}/query/attributes`).then(r => (r.ok ? r.json() : r)).then(getIn('query.entries'));
    }

    /**
     * Returns all dimensions in a project specified by projectId param
     *
     * @method getDimensions
     * @param {string} projectId Project identifier
     * @return {Array} An array of dimension objects
     * @see getFolders
     */
    function getDimensions(projectId) {
        return xhr.get(`/gdc/md/${projectId}/query/dimensions`).then(r => (r.ok ? r.json() : r)).then(getIn('query.entries'));
    }

    /**
     * Returns project folders. Folders can be of specific types and you can specify
     * the type you need by passing and optional `type` parameter
     *
     * @method getFolders
     * @param {String} projectId - Project identifier
     * @param {String} type - Optional, possible values are `metric`, `fact`, `attribute`
     * @return {Array} An array of dimension objects
     */
    function getFolders(projectId, type) {
        function getFolderEntries(pId, t) {
            const typeURL = t ? `?type=${t}` : '';

            return xhr.get(`/gdc/md/${pId}/query/folders${typeURL}`).then(getIn('query.entries'));
        }

        switch (type) {
            case 'fact':
            case 'metric':
                return getFolderEntries(projectId, type);
            case 'attribute':
                return getDimensions(projectId);
            default:
                return Promise.all([
                    getFolderEntries(projectId, 'fact'),
                    getFolderEntries(projectId, 'metric'),
                    getDimensions(projectId)
                ])
                    .then(([facts, metrics, attributes]) => {
                        return { fact: facts, metric: metrics, attribute: attributes };
                    });
        }
    }

    /**
     * Returns all facts in a project specified by the given projectId
     *
     * @method getFacts
     * @param {string} projectId Project identifier
     * @return {Array} An array of fact objects
     */
    function getFacts(projectId) {
        return xhr.get(`/gdc/md/${projectId}/query/facts`).then(r => (r.ok ? r.json() : r)).then(getIn('query.entries'));
    }

    /**
     * Returns all metrics in a project specified by the given projectId
     *
     * @method getMetrics
     * @param {string} projectId Project identifier
     * @return {Array} An array of metric objects
     */
    function getMetrics(projectId) {
        return xhr.get(`/gdc/md/${projectId}/query/metrics`).then(r => (r.ok ? r.json() : r)).then(getIn('query.entries'));
    }

    /**
     * Returns all metrics that are reachable (with respect to ldm of the project
     * specified by the given projectId) for given attributes
     *
     * @method getAvailableMetrics
     * @param {String} projectId - Project identifier
     * @param {Array} attrs - An array of attribute uris for which we want to get
     * availabale metrics
     * @return {Array} An array of reachable metrics for the given attrs
     * @see getAvailableAttributes
     * @see getAvailableFacts
     */
    function getAvailableMetrics(projectId, attrs) {
        return xhr.post(`/gdc/md/${projectId}/availablemetrics`, {
            data: JSON.stringify(attrs)
        }).then(r => (r.ok ? r.json() : r)).then(r => r.entries);
    }

    /**
     * Returns all attributes that are reachable (with respect to ldm of the project
     * specified by the given projectId) for given metrics (also called as drillCrossPath)
     *
     * @method getAvailableAttributes
     * @param {String} projectId - Project identifier
     * @param {Array} metrics - An array of metric uris for which we want to get
     * availabale attributes
     * @return {Array} An array of reachable attributes for the given metrics
     * @see getAvailableMetrics
     * @see getAvailableFacts
     */
    function getAvailableAttributes(projectId, metrics) {
        return xhr.post(`/gdc/md/${projectId}/drillcrosspaths`, {
            body: JSON.stringify(metrics)
        }).then(r => (r.ok ? r.json() : r)).then(r => r.drillcrosspath.links);
    }

    /**
     * Returns all attributes that are reachable (with respect to ldm of the project
     * specified by the given projectId) for given metrics (also called as drillCrossPath)
     *
     * @method getAvailableFacts
     * @param {String} projectId - Project identifier
     * @param {Array} items - An array of metric or attribute uris for which we want to get
     * availabale facts
     * @return {Array} An array of reachable facts for the given items
     * @see getAvailableAttributes
     * @see getAvailableMetrics
     */
    function getAvailableFacts(projectId, items) {
        return xhr.post(`/gdc/md/${projectId}/availablefacts`, {
            data: JSON.stringify(items)
        }).then(r => (r.ok ? r.json() : r)).then(r => r.entries);
    }

    /**
     * Get details of a metadata object specified by its uri
     *
     * @method getObjectDetails
     * @param uri uri of the metadata object for which details are to be retrieved
     * @return {Object} object details
     */
    function getObjectDetails(uri) {
        return xhr.get(uri);
    }

    /**
     * Get folders with items.
     * Returns array of folders, each having a title and items property which is an array of
     * corresponding items. Each item is either a metric or attribute, keeping its original
     * verbose structure.
     *
     * @method getFoldersWithItems
     * @param {String} type type of folders to return
     * @return {Array} Array of folder object, each containing title and
     * corresponding items.
     */
    function getFoldersWithItems(projectId, type) {
        // fetch all folders of given type and process them
        return getFolders(projectId, type).then((folders) => {
            // Helper function to get details for each metric in the given
            // array of links to the metadata objects representing the metrics.
            // @return the array of promises
            function getMetricItemsDetails(array) {
                return Promise.all(array.map(getObjectDetails)).then((metricArgs) => {
                    return metricArgs.map(item => item.metric);
                });
            }

            // helper mapBy function
            function mapBy(array, key) {
                return array.map((item) => {
                    return item[key];
                });
            }

            // helper for sorting folder tree structure
            // sadly @returns void (sorting == mutating array in js)
            const sortFolderTree = (structure) => {
                structure.forEach((folder) => {
                    folder.items.sort((a, b) => {
                        if (a.meta.title < b.meta.title) {
                            return -1;
                        } else if (a.meta.title > b.meta.title) {
                            return 1;
                        }

                        return 0;
                    });
                });
                structure.sort((a, b) => {
                    if (a.title < b.title) {
                        return -1;
                    } else if (a.title > b.title) {
                        return 1;
                    }

                    return 0;
                });
            };

            const foldersLinks = mapBy(folders, 'link');
            const foldersTitles = mapBy(folders, 'title');

            // fetch details for each folder
            return Promise.all(foldersLinks.map(getObjectDetails)).then((folderDetails) => {
                // if attribute, just parse everything from what we've received
                // and resolve. For metrics, lookup again each metric to get its
                // identifier. If passing unsupported type, reject immediately.
                if (type === 'attribute') {
                    // get all attributes, subtract what we have and add rest in unsorted folder
                    return getAttributes(projectId).then((attributes) => {
                        // get uris of attributes which are in some dimension folders
                        const attributesInFolders = [];
                        folderDetails.forEach((fd) => {
                            fd.dimension.content.attributes.forEach((attr) => {
                                attributesInFolders.push(attr.meta.uri);
                            });
                        });
                        // unsortedUris now contains uris of all attributes which aren't in a folder
                        const unsortedUris =
                            attributes
                                .filter(item => attributesInFolders.indexOf(item.link) === -1)
                                .map(item => item.link);
                        // now get details of attributes in no folders
                        return Promise.all(unsortedUris.map(getObjectDetails))
                            .then((unsortedAttributeArgs) => { // TODO add map to r.json
                                // get unsorted attribute objects
                                const unsortedAttributes = unsortedAttributeArgs.map(attr => attr.attribute);
                                // create structure of folders with attributes
                                const structure = folderDetails.map((folderDetail) => {
                                    return {
                                        title: folderDetail.dimension.meta.title,
                                        items: folderDetail.dimension.content.attributes
                                    };
                                });
                                // and append "Unsorted" folder with attributes to the structure
                                structure.push({
                                    title: 'Unsorted',
                                    items: unsortedAttributes
                                });
                                sortFolderTree(structure);

                                return structure;
                            });
                    });
                } else if (type === 'metric') {
                    const entriesLinks = folderDetails.map(entry => mapBy(entry.folder.content.entries, 'link'));
                    // get all metrics, subtract what we have and add rest in unsorted folder
                    return getMetrics(projectId).then((metrics) => {
                        // get uris of metrics which are in some dimension folders
                        const metricsInFolders = [];
                        folderDetails.forEach((fd) => {
                            fd.folder.content.entries.forEach((metric) => {
                                metricsInFolders.push(metric.link);
                            });
                        });
                        // unsortedUris now contains uris of all metrics which aren't in a folder
                        const unsortedUris =
                            metrics
                                .filter(item => metricsInFolders.indexOf(item.link) === -1)
                                .map(item => item.link);

                        // sadly order of parameters of concat matters! (we want unsorted last)
                        entriesLinks.push(unsortedUris);

                        // now get details of all metrics
                        return Promise.all(entriesLinks.map(linkArray => getMetricItemsDetails(linkArray)))
                            .then((tree) => { // TODO add map to r.json
                                // all promises resolved, i.e. details for each metric are available
                                const structure = tree.map((treeItems, idx) => {
                                    // if idx is not in foldes list than metric is in "Unsorted" folder
                                    return {
                                        title: (foldersTitles[idx] || 'Unsorted'),
                                        items: treeItems
                                    };
                                });
                                sortFolderTree(structure);
                                return structure;
                            });
                    });
                }

                return Promise.reject();
            });
        });
    }

    /**
     * Get identifier of a metadata object identified by its uri
     *
     * @method getObjectIdentifier
     * @param uri uri of the metadata object for which the identifier is to be retrieved
     * @return {String} object identifier
     */
    function getObjectIdentifier(uri) {
        function idFinder(obj) {
            if (obj.attribute) {
                return obj.attribute.content.displayForms[0].meta.identifier;
            } else if (obj.dimension) {
                return obj.dimension.content.attributes.content.displayForms[0].meta.identifier;
            } else if (obj.metric) {
                return obj.metric.meta.identifier;
            }

            throw Error('Unknown object!');
        }

        if (!isPlainObject(uri)) {
            return getObjectDetails(uri).then(data => idFinder(data));
        }
        return Promise.resolve(idFinder(uri));
    }

    /**
     * Get uri of an metadata object, specified by its identifier and project id it belongs to
     *
     * @method getObjectUri
     * @param {string} projectId id of the project
     * @param identifier identifier of the metadata object
     * @return {String} uri of the metadata object
     */
    function getObjectUri(projectId, identifier) {
        return xhr.ajax(`/gdc/md/${projectId}/identifiers`, {
            method: 'POST',
            body: {
                identifierToUri: [identifier]
            }
        }).then(xhr.parseJSON).then((data) => {
            const found = data.identifiers.find(pair => pair.identifier === identifier);

            if (found) {
                return found.uri;
            }

            throw new Error(`Object with identifier ${identifier} not found in project ${projectId}`);
        });
    }

    /**
     * Get uris specified by identifiers
     *
     * @method getUrisFromIdentifiers
     * @param {String} projectId id of the project
     * @param {Array} identifiers identifiers of the metadata objects
     * @return {Array} array of identifier + uri pairs
     */
    function getUrisFromIdentifiers(projectId, identifiers) {
        return xhr.post(`/gdc/md/${projectId}/identifiers`, {
            body: {
                identifierToUri: identifiers
            }
        }).then(xhr.parseJSON).then((data) => {
            return data.identifiers;
        });
    }

    /**
     * Get identifiers specified by uris
     *
     * @method getIdentifiersFromUris
     * @param {String} projectId id of the project
     * @param {Array} uris of the metadata objects
     * @return {Array} array of identifier + uri pairs
     */
    function getIdentifiersFromUris(projectId, uris) {
        return xhr.post(`/gdc/md/${projectId}/identifiers`, {
            body: {
                uriToIdentifier: uris
            }
        }).then(xhr.parseJSON).then((data) => {
            return data.identifiers;
        });
    }

    /**
     * Get attribute elements with their labels and uris.
     *
     * @param {String} projectId id of the project
     * @param {String} labelUri uri of the label (display form)
     * @param {Array<String>} patterns elements labels/titles (for EXACT mode), or patterns (for WILD mode)
     * @param {('EXACT'|'WILD')} mode match mode, currently only EXACT supported
     * @return {Array} array of elementLabelUri objects
     */
    function translateElementLabelsToUris(projectId, labelUri, patterns, mode = 'EXACT') {
        return xhr.post(`/gdc/md/${projectId}/labels`, {
            body: {
                elementLabelToUri: [
                    {
                        labelUri,
                        mode,
                        patterns
                    }
                ]
            }
        }).then(r => (r.ok ? r.json() : r)).then(r => _get(r, 'elementLabelUri'));
    }

    /**
     * Get valid elements of an attribute, specified by its identifier and project id it belongs to
     *
     * @method getValidElements
     * @param {string} projectId id of the project
     * @param id display form id of the metadata object
     * @param {Object} options objects with options:
     *      - limit {Number}
     *      - offset {Number}
     *      - order {String} 'asc' or 'desc'
     *      - filter {String}
     *      - prompt {String}
     *      - uris {Array}
     *      - complement {Boolean}
     *      - includeTotalCountWithoutFilters {Boolean}
     *      - restrictiveDefinition {String}
     * @return {Object} ValidElements response with:
     *      - items {Array} elements
     *      - paging {Object}
     *      - elementsMeta {Object}
     */
    function getValidElements(projectId, id, options = {}) {
        const query = pick(options, ['limit', 'offset', 'order', 'filter', 'prompt']);
        const queryParams = queryString(query);

        const requestBody = pick(options, ['uris', 'complement', 'includeTotalCountWithoutFilters', 'restrictiveDefinition']);
        return xhr.post(`/gdc/md/${projectId}/obj/${id}/validElements${queryParams}`.replace(/\?$/, ''), {
            data: JSON.stringify({
                validElementsRequest: requestBody
            })
        }).then(xhr.parseJSON);
    }

    /**
     * Delete object
     *
     * @experimental
     * @method deleteObject
     * @param {String} uri of the object to be deleted
     */
    function deleteObject(uri) {
        return xhr.del(uri);
    }

    /**
     * Create object
     *
     * @experimental
     * @method createObject
     * @param {String} projectId
     * @param {String} obj object definition
     */
    function createObject(projectId, obj) {
        return xhr.post(`/gdc/md/${projectId}/obj?createAndGet=true`, {
            data: JSON.stringify(obj)
        }).then(xhr.parseJSON);
    }

    function isTaskFinished(task) {
        const taskState = task.wTaskStatus.status;
        return taskState === 'OK' || taskState === 'ERROR';
    }

    function checkStatusForError(response) {
        if (response.wTaskStatus.status === 'ERROR') {
            return Promise.reject(response);
        }
        return response;
    }

    /**
     * LDM manage
     *
     * @experimental
     * @method ldmManage
     * @param {String} projectId
     * @param {String} maql
     * @param {Object} options for polling (maxAttempts, pollStep)
     */
    function ldmManage(projectId, maql, options = {}) {
        return xhr.post(`/gdc/md/${projectId}/ldm/manage2`, {
            data: JSON.stringify({
                manage: { maql }
            })
        })
            .then(xhr.parseJSON)
            .then((response) => {
                const manageStatusUri = response.entries[0].link;
                return handlePolling(xhr.get, manageStatusUri, isTaskFinished, options);
            })
            .then(checkStatusForError);
    }

    /**
     * ETL pull
     *
     * @experimental
     * @method etlPull
     * @param {String} projectId
     * @param {String} uploadsDir
     * @param {Object} options for polling (maxAttempts, pollStep)
     */
    function etlPull(projectId, uploadsDir, options = {}) {
        return xhr.post(`/gdc/md/${projectId}/etl/pull2`, {
            data: JSON.stringify({
                pullIntegration: uploadsDir
            })
        })
            .then(xhr.parseJSON)
            .then((response) => {
                const etlPullStatusUri = response.pull2Task.links.poll;
                return handlePolling(xhr.get, etlPullStatusUri, isTaskFinished, options);
            })
            .then(checkStatusForError);
    }

    return {
        createObject,
        deleteObject,
        etlPull,
        getAttributes,
        getAvailableAttributes,
        getAvailableFacts,
        getAvailableMetrics,
        getDimensions,
        getFacts,
        getFoldersWithItems,
        getIdentifiersFromUris,
        getMetrics,
        getObjectDetails,
        getObjectIdentifier,
        getObjects,
        getObjectsByQuery,
        getObjectUri,
        getObjectUsing,
        getObjectUsingMany,
        getUrisFromIdentifiers,
        getValidElements,
        getVisualizations,
        ldmManage,
        translateElementLabelsToUris
    };
}
