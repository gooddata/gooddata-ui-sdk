// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
import $ from 'jquery';
import { ajax, get, post } from './xhr';
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
        }).then(result => _get(result, ['objects', 'items']));
    });

    return $.when.apply(this, promises).then((...resultingEntries) => {
        return flatten(resultingEntries);
    });
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
    /*eslint-disable new-cap*/
    const d = $.Deferred();
    /*eslint-enable new-cap*/

    const fns = elementUris.map(function mapUrisToRequests(uri) {
        return ajax(uri);
    });

    $.when.apply(this, fns).done(function requestsDone() {
        // arguments is the array of resolved
        const args = Array.prototype.slice.call(arguments);

        const enriched = args.map(function mapArgumentsToObjects(element) {
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

        enriched.forEach(function loopEnrichedObjects(el, idx) {
            if (el.formOf) {
                formOfFns.push(ajax(el.formOf));
                ids[el.uri] = idx;
                indi[i++] = idx;
            }
        });

        // all formOf are executed
        $.when.apply(this, formOfFns).done(function formOfRequestsDone() {
            const formOfArgs = Array.prototype.slice.call(arguments);

            formOfArgs.forEach(function loopFormOfRequests(arg, idx) {
                // get element to owerwrite
                const which = indi[idx];
                const update = enriched[which];

                update.name = arg[0].attribute.meta.title;
            });

            d.resolve(enriched);
        });
    });

    return d.promise();
}

/**
* Reutrns all attributes in a project specified by projectId param
*
* @method getAttributes
* @param projectId Project identifier
* @return {Array} An array of attribute objects
*/
export function getAttributes(projectId) {
    return get('/gdc/md/' + projectId + '/query/attributes').then(getIn('query.entries'));
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
    return get('/gdc/md/' + projectId + '/query/dimensions').then(getIn('query.entries'));
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
            /*eslint-disable new-cap*/
            const d = $.Deferred();
            /*eslint-enable new-cap*/
            $.when(_getFolders(projectId, 'fact'),
                    _getFolders(projectId, 'metric'),
                    getDimensions(projectId)).done(function requestsDone(facts, metrics, attributes) {
                d.resolve({fact: facts, metric: metrics, attribute: attributes});
            });
            return d.promise();
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
    /*eslint-disable new-cap*/
    const result = $.Deferred();
    /*eslint-enable new-cap*/

    // fetch all folders of given type and process them
    getFolders(projectId, type).then(function resolveGetForlders(folders) {
        // Helper function to get details for each metric in the given
        // array of links to the metadata objects representing the metrics.
        // @return the array of promises
        function getMetricItemsDetails(array) {
            /*eslint-disable new-cap*/
            const d = $.Deferred();
            /*eslint-enable new-cap*/
            $.when.apply(this, array.map(getObjectDetails)).then(function getObjectDetailsDone() {
                const metrics = Array.prototype.slice.call(arguments).map(function mapObjectsToMetricNames(item) {
                    return item.metric;
                });
                d.resolve(metrics);
            }, d.reject);
            return d.promise();
        }

        // helper mapBy function
        function mapBy(array, key) {
            return array.map(function mapKeyToItem(item) {
                return item[key];
            });
        }

        // helper for sorting folder tree structure
        // sadly @returns void (sorting == mutating array in js)
        /*eslint-disable func-names*/
        const sortFolderTree = function(structure) {
            structure.forEach(function(folder) {
                folder.items.sort(function(a, b) {
                    if (a.meta.title < b.meta.title) {
                        return -1;
                    } else if (a.meta.title > b.meta.title) {
                        return 1;
                    }

                    return 0;
                });
            });
            structure.sort(function(a, b) {
                if (a.title < b.title) {
                    return -1;
                } else if (a.title > b.title) {
                    return 1;
                }

                return 0;
            });
        };
        /*eslint-enable func-names*/

        const foldersLinks = mapBy(folders, 'link');
        const foldersTitles = mapBy(folders, 'title');

        // fetch details for each folder
        $.when.apply(this, foldersLinks.map(getObjectDetails)).then(function() {
            var folderDetails = Array.prototype.slice.call(arguments);

            // if attribute, just parse everything from what we've received
            // and resolve. For metrics, lookup again each metric to get its
            // identifier. If passing unsupported type, reject immediately.
            if (type === 'attribute') {
                // get all attributes, subtract what we have and add rest in unsorted folder
                getAttributes(projectId).then(function(attributes) {
                    // get uris of attributes which are in some dimension folders
                    var attributesInFolders = [];
                    folderDetails.forEach(function(fd) {
                        fd.dimension.content.attributes.forEach(function(attr) {
                            attributesInFolders.push(attr.meta.uri);
                        });
                    });
                    // unsortedUris now contains uris of all attributes which aren't in a folder
                    var unsortedUris =
                        attributes
                            .filter(function(item) { return attributesInFolders.indexOf(item.link) === -1; })
                            .map(function(item) { return item.link; });
                    // now get details of attributes in no folders
                    $.when.apply(this, unsortedUris.map(getObjectDetails)).then(function() {
                        // get unsorted attribute objects
                        var unsortedAttributes = Array.prototype.slice.call(arguments).map(function(attr) { return attr.attribute; });
                        // create structure of folders with attributes
                        var structure = folderDetails.map(function(folderDetail) {
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
                        result.resolve(structure);
                    });
                });
            } else if (type === 'metric') {
                var entriesLinks = folderDetails.map(function(entry) {
                    return mapBy(entry.folder.content.entries, 'link');
                });
                // get all metrics, subtract what we have and add rest in unsorted folder
                getMetrics(projectId).then(function(metrics) {
                    // get uris of metrics which are in some dimension folders
                    var metricsInFolders = [];
                    folderDetails.forEach(function(fd) {
                        fd.folder.content.entries.forEach(function(metric) {
                            metricsInFolders.push(metric.link);
                        });
                    });
                    // unsortedUris now contains uris of all metrics which aren't in a folder
                    var unsortedUris =
                        metrics
                            .filter(function(item) { return metricsInFolders.indexOf(item.link) === -1; })
                            .map(function(item) { return item.link; });

                    // sadly order of parameters of concat matters! (we want unsorted last)
                    entriesLinks.push(unsortedUris);

                    // now get details of all metrics
                    $.when.apply(this, entriesLinks.map(function(linkArray, idx) {
                        return getMetricItemsDetails(linkArray);
                    })).then(function() {
                        // all promises resolved, i.e. details for each metric are available
                        var tree = Array.prototype.slice.call(arguments);
                        var structure = tree.map(function(treeItems, idx) {
                            // if idx is not in foldes list than metric is in "Unsorted" folder
                            return {
                                title: (foldersTitles[idx] || "Unsorted"),
                                items: treeItems
                            };
                        });
                        sortFolderTree(structure);
                        result.resolve(structure);
                    }, result.reject);
                });
            } else {
                result.reject();
            }
        });
    }, result.reject);

    return result.promise();
}
/*eslint-enable*/

/**
 * Returns all facts in a project specified by the given projectId
 *
 * @method getFacts
 * @param projectId Project identifier
 * @return {Array} An array of fact objects
 */
export function getFacts(projectId) {
    return get('/gdc/md/' + projectId + '/query/facts').then(getIn('query.entries'));
}

/**
 * Returns all metrics in a project specified by the given projectId
 *
 * @method getMetrics
 * @param projectId Project identifier
 * @return {Array} An array of metric objects
 */
export function getMetrics(projectId) {
    return get('/gdc/md/' + projectId + '/query/metrics').then(getIn('query.entries'));
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
    /*eslint-disable new-cap*/
    const d = $.Deferred();
    /*eslint-enable new-cap*/

    post('/gdc/md/' + projectId + '/availablemetrics', {
        data: JSON.stringify(attrs)
    }).then(function resolveAvailableMetrics(result) {
        d.resolve(result.entries);
    }, d.reject);

    return d.promise();
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
    /*eslint-disable new-cap*/
    const d = $.Deferred();
    /*eslint-enable new-cap*/

    post('/gdc/md/' + projectId + '/drillcrosspaths', {
        data: JSON.stringify(metrics)
    }).then(function resolveAvailableAttributes(result) {
        d.resolve(result.drillcrosspath.links);
    }, d.reject);

    return d.promise();
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
    /*eslint-disable new-cap*/
    const d = $.Deferred();
    /*eslint-enable new-cap*/

    post('/gdc/md/' + projectId + '/availablefacts', {
        data: JSON.stringify(items)
    }).then(function resolveAvailableFacts(result) {
        d.resolve(result.entries);
    }, d.reject);

    return d.promise();
}

/**
 * Get details of a metadata object specified by its uri
 *
 * @method getObjectDetails
 * @param uri uri of the metadata object for which details are to be retrieved
 * @return {Object} object details
 */
export function getObjectDetails(uri) {
    /*eslint-disable new-cap*/
    const d = $.Deferred();
    /*eslint-enable new-cap*/

    get(uri, {
        headers: { Accept: 'application/json' },
        dataType: 'json',
        contentType: 'application/json'
    }).then(function resolveGetObject(res) {
        d.resolve(res);
    }, d.reject);

    return d.promise();
}

/**
 * Get identifier of a metadata object identified by its uri
 *
 * @method getObjectIdentifier
 * @param uri uri of the metadata object for which the identifier is to be retrieved
 * @return {String} object identifier
 */
export function getObjectIdentifier(uri) {
    /*eslint-disable new-cap*/
    const d = $.Deferred();
    /*eslint-enable new-cap*/
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

    if (!$.isPlainObject(uri)) {
        getObjectDetails(uri).then(function resolveGetObjectDetails(data) { d.resolve(idFinder(data)); }, d.reject);
    } else {
        d.resolve(idFinder(uri));
    }

    return d.promise();
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
    /*eslint-disable new-cap*/
    const d = $.Deferred();
    /*eslint-enable new-cap*/
    function uriFinder(obj) {
        const data = (obj.attribute) ? obj.attribute : obj.metric;
        return data.meta.uri;
    }

    ajax('/gdc/md/' + projectId + '/identifiers', {
        type: 'POST',
        headers: { Accept: 'application/json' },
        data: {
            identifierToUri: [identifier]
        }
    }).then(function resolveIdentifiers(data) {
        const found = data.identifiers.filter(function findObjectByIdentifier(i) {
            return i.identifier === identifier;
        });

        if (found[0]) {
            return getObjectDetails(found[0].uri);
        }

        /*eslint-disable new-cap*/
        return $.Deferred().reject('identifier not found');
        /*eslint-enable new-cap*/
    }, d.reject).then(function resolveObjectDetails(objData) {
        if (!objData.attributeDisplayForm) {
            return d.resolve(uriFinder(objData));
        }
        return getObjectDetails(objData.attributeDisplayForm.content.formOf).then(function resolve(objectData) {
            d.resolve(uriFinder(objectData));
        }, d.reject);
    }, d.reject);

    return d.promise();
}
