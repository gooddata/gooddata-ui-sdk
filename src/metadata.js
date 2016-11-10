// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
import { isPlainObject } from 'lodash';
import { ajax, get, post, parseJSON } from './xhr';
import { getIn } from './util';
import { get as _get, chunk, flatten } from 'lodash';

/**
 * Functions for working with metadata objects
 *
 * @class metadata
 * @module metadata
 */

/**
 * Load all objects with given uris
 * (use bulk loading instead of getting objects one by one)
 *
 * @method getObjects
 * @param {String} projectId id of the project
 * @param {Array} objectUris array of uris for objects to be loaded
 * @return {Array} array of loaded elements
 */
export function getObjects(projectId, objectUris) {
    const LIMIT = 50;
    const uri = `/gdc/md/${projectId}/objects/get`;

    const objectsUrisChunks = chunk(objectUris, LIMIT);

    const promises = objectsUrisChunks.map(objectUrisChunk => {
        const data = {
            get: {
                items: objectUrisChunk
            }
        };

        return post(uri, {
            data: JSON.stringify(data)
        }).then(r => {
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
export function getObjectUsing(projectId, uri, options = {}) {
    const { types = [], nearest = false } = options;
    const resourceUri = `/gdc/md/${projectId}/using2`;

    const data = {
        inUse: {
            uri,
            types,
            nearest: nearest ? 1 : 0
        }
    };

    return post(resourceUri, {
        data: JSON.stringify(data)
    }).then(r => {
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
export function getObjectUsingMany(projectId, uris, options = {}) {
    const { types = [], nearest = false } = options;
    const resourceUri = `/gdc/md/${projectId}/using2`;

    const data = {
        inUseMany: {
            uris,
            types,
            nearest: nearest ? 1 : 0
        }
    };

    return post(resourceUri, {
        data: JSON.stringify(data)
    }).then(r => {
        if (!r.ok) {
            const err = new Error(r.statusText);
            err.response = r;
            throw err;
        }

        return r.json();
    }).then(result => result.useMany);
}

/**
 * Get additional information about elements specified by their uris
 * `elementUris` is the array of uris of elements to be look-up
 * Currently makes a request for each object, should be encapsulated
 * to one call
 *
 * @method getElementDetails
 * @param {Array} array of element uri strings
 * @private
 */
export function getElementDetails(elementUris) {
    const fns = elementUris.map(uri => get(uri));

    return Promise.all(fns).then((...args) => {
        const enriched = args.map(element => {
            const root = element[0];
            if (root.attributeDisplayForm) {
                return {
                    type: 'attribute',
                    uri: root.attributeDisplayForm.meta.uri,
                    formOf: root.attributeDisplayForm.content.formOf,
                    name: root.attributeDisplayForm.meta.title
                };
            } else if (root.metric) {
                return {
                    type: 'metric',
                    uri: root.metric.meta.uri,
                    name: root.metric.meta.title
                };
            }
        });

        // override titles with related attribute title
        const ids = {};
        const indi = [];
        let i = 0;
        const formOfFns = [];

        enriched.forEach((el, idx) => {
            if (el.formOf) {
                formOfFns.push(get(el.formOf));
                ids[el.uri] = idx;
                indi[i++] = idx;
            }
        });

        // all formOf are executed
        return Promise.all(formOfFns).then((...formOfArgs) => {
            formOfArgs.forEach((arg, idx) => {
                // get element to owerwrite
                const which = indi[idx];
                const update = enriched[which];

                update.name = arg[0].attribute.meta.title;
            });

            return enriched;
        });
    });
}

/**
* Reutrns all attributes in a project specified by projectId param
*
* @method getAttributes
* @param projectId Project identifier
* @return {Array} An array of attribute objects
*/
export function getAttributes(projectId) {
    return get('/gdc/md/' + projectId + '/query/attributes').then(r => r.ok ? r.json() : r).then(getIn('query.entries'));
}

/**
 * Returns all dimensions in a project specified by projectId param
 *
 * @method getDimensions
 * @param projectId Project identifier
 * @return {Array} An array of dimension objects
 * @see getFolders
 */
export function getDimensions(projectId) {
    return get('/gdc/md/' + projectId + '/query/dimensions').then(r => r.ok ? r.json() : r).then(getIn('query.entries'));
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
export function getFolders(projectId, type) {
    function _getFolders(pId, t) {
        const typeURL = t ? '?type=' + t : '';

        return get('/gdc/md/' + pId + '/query/folders' + typeURL).then(getIn('query.entries'));
    }

    switch (type) {
        case 'fact':
        case 'metric':
            return _getFolders(projectId, type);
        case 'attribute':
            return getDimensions(projectId);
        default:
            return Promise.all([_getFolders(projectId, 'fact'),
                         _getFolders(projectId, 'metric'),
                         getDimensions(projectId)])
            .then((facts, metrics, attributes) => {
                return { fact: facts, metric: metrics, attribute: attributes };
            });
    }
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
/*eslint-disable*/
export function getFoldersWithItems(projectId, type) {
    // fetch all folders of given type and process them
    return getFolders(projectId, type).then((folders) => {
        // Helper function to get details for each metric in the given
        // array of links to the metadata objects representing the metrics.
        // @return the array of promises
        function getMetricItemsDetails(array) {
            return Promise.all(array.map(getObjectDetails)).then((...metricArgs) => {
                return metricArgs.map(item => item.metric);
            });
        }

        // helper mapBy function
        function mapBy(array, key) {
            return array.map(function mapKeyToItem(item) {
                return item[key];
            });
        }

        // helper for sorting folder tree structure
        // sadly @returns void (sorting == mutating array in js)
        const sortFolderTree = structure => {
            structure.forEach(folder => {
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
        return Promise.all(foldersLinks.map(getObjectDetails)).then((...folderDetails) => {
            // if attribute, just parse everything from what we've received
            // and resolve. For metrics, lookup again each metric to get its
            // identifier. If passing unsupported type, reject immediately.
            if (type === 'attribute') {
                // get all attributes, subtract what we have and add rest in unsorted folder
                getAttributes(projectId).then(attributes => {
                    // get uris of attributes which are in some dimension folders
                    const attributesInFolders = [];
                    folderDetails.forEach(fd => {
                        fd.dimension.content.attributes.forEach(attr => {
                            attributesInFolders.push(attr.meta.uri);
                        });
                    });
                    // unsortedUris now contains uris of all attributes which aren't in a folder
                    const unsortedUris =
                        attributes
                            .filter(item => attributesInFolders.indexOf(item.link) === -1)
                            .map(item => item.link);
                    // now get details of attributes in no folders
                    return Promise.all(unsortedUris.map(getObjectDetails)).then((...unsortedAttributeArgs) => { //TODO add map to r.json
                        // get unsorted attribute objects
                        const unsortedAttributes = unsortedAttributeArgs.map(attr => attr.attribute);
                        // create structure of folders with attributes
                        const structure = folderDetails.map(folderDetail => {
                            return {
                                title: folderDetail.dimension.meta.title,
                                items: folderDetail.dimension.content.attributes
                            };
                        });
                        // and append "Unsorted" folder with attributes to the structure
                        structure.push({
                            title: "Unsorted",
                            items: unsortedAttributes
                        });
                        sortFolderTree(structure);

                        return structure;
                    });
                });
            } else if (type === 'metric') {
                const entriesLinks = folderDetails.map(entry => mapBy(entry.folder.content.entries, 'link'));
                // get all metrics, subtract what we have and add rest in unsorted folder
                return getMetrics(projectId).then(metrics => {
                    // get uris of metrics which are in some dimension folders
                    const metricsInFolders = [];
                    folderDetails.forEach(fd => {
                        fd.folder.content.entries.forEach(metric => {
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
                    return Promise.all(entriesLinks.map((linkArray, idx) => getMetricItemsDetails(linkArray))).then((...tree) => { //TODO add map to r.json
                        // all promises resolved, i.e. details for each metric are available
                        const structure = tree.map((treeItems, idx) => {
                            // if idx is not in foldes list than metric is in "Unsorted" folder
                            return {
                                title: (foldersTitles[idx] || "Unsorted"),
                                items: treeItems
                            };
                        });
                        sortFolderTree(structure);
                        return structure
                    });
                });
            } else {
                return Promise.reject();
            }
        });
    });
}

/**
 * Returns all facts in a project specified by the given projectId
 *
 * @method getFacts
 * @param projectId Project identifier
 * @return {Array} An array of fact objects
 */
export function getFacts(projectId) {
    return get('/gdc/md/' + projectId + '/query/facts').then(r => r.ok ? r.json() : r).then(getIn('query.entries'));
}

/**
 * Returns all metrics in a project specified by the given projectId
 *
 * @method getMetrics
 * @param projectId Project identifier
 * @return {Array} An array of metric objects
 */
export function getMetrics(projectId) {
    return get('/gdc/md/' + projectId + '/query/metrics').then(r => r.ok ? r.json() : r).then(getIn('query.entries'));
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
export function getAvailableMetrics(projectId, attrs) {
    return post('/gdc/md/' + projectId + '/availablemetrics', {
        data: JSON.stringify(attrs)
    }).then(r => r.ok ? r.json() : r).then(r => r.entries)
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
export function getAvailableAttributes(projectId, metrics) {
    return post('/gdc/md/' + projectId + '/drillcrosspaths', {
        body: JSON.stringify(metrics)
    }).then(r => r.ok ? r.json() : r).then(r => r.drillcrosspath.links);
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
export function getAvailableFacts(projectId, items) {
    return post('/gdc/md/' + projectId + '/availablefacts', {
        data: JSON.stringify(items)
    }).then(r => r.ok ? r.json() : r).then(r => r.entries);
}

/**
 * Get details of a metadata object specified by its uri
 *
 * @method getObjectDetails
 * @param uri uri of the metadata object for which details are to be retrieved
 * @return {Object} object details
 */
export function getObjectDetails(uri) {
    return get(uri);
}

/**
 * Get identifier of a metadata object identified by its uri
 *
 * @method getObjectIdentifier
 * @param uri uri of the metadata object for which the identifier is to be retrieved
 * @return {String} object identifier
 */
export function getObjectIdentifier(uri) {
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
 * @param projectId id of the project
 * @param identifier identifier of the metadata object
 * @return {String} uri of the metadata object
 */
export function getObjectUri(projectId, identifier) {
    function uriFinder(obj) {
        const data = (obj.attribute) ? obj.attribute : obj.metric;
        return data.meta.uri;
    }

    return ajax('/gdc/md/' + projectId + '/identifiers', {
        method: 'POST',
        body: {
            identifierToUri: [identifier]
        }
    }).then(parseJSON).then(data => {
        const found = data.identifiers.filter(i => i.identifier === identifier);

        if (found[0]) {
            return getObjectDetails(found[0].uri);
        }
        throw new Error(`Object with identifier ${identifier} not found in project ${projectId}`);
    }).then(objData => {
        if (!objData.attributeDisplayForm) {
            return uriFinder(objData);
        }
        return getObjectDetails(objData.attributeDisplayForm.content.formOf).then(objectData => {
            return uriFinder(objectData);
        });
    });
}
