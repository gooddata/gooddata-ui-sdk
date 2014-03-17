// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
define(['xhr', 'util'], function(xhr, util) {
    'use strict';

    /**
     * Functions for working with metadata objects
     *
     * @class metadata
     * @module metadata
     */


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
    var getElementDetails = function(elementUris) {
        var d = $.Deferred();

        var fns = elementUris.map(function(uri) {
            return xhr.ajax(uri);
        });

        $.when.apply(this, fns).done(function() {
            // arguments is the array of resolved
            var args = Array.prototype.slice.call(arguments);

            var enriched = args.map(function(element) {
                var root = element[0];
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
            var uri2fn = {};
            var ids = {};

            var indi = [], i = 0;

            var fns = [];

            enriched.forEach(function(el, idx) {
                if (el.formOf) {
                    fns.push(xhr.ajax(el.formOf));
                    ids[el.uri] = idx;
                    indi[i++] = idx;
                }
            });

            // all formOf are executed
            $.when.apply(this, fns).done(function() {
                var args = Array.prototype.slice.call(arguments);

                args.forEach(function(arg, idx) {
                    // get element to owerwrite
                    var which = indi[idx];
                    var update = enriched[which];

                    update.name = arg[0].attribute.meta.title;
                });

                d.resolve(enriched);
            });

        });
        return d.promise();
    };

    /**
     * Reutrns all attributes in a project specified by projectId param
     *
     * @method getAttributes
     * @param projectId Project identifier
     * @return {Array} An array of attribute objects
     */
    var getAttributes = function(projectId) {
        return xhr.get('/gdc/md/' + projectId + '/query/attributes').then(util.getIn('query.entries'));
    };

    /**
     * Returns all dimensions in a project specified by projectId param
     *
     * @method getDimensions
     * @param projectId Project identifier
     * @return {Array} An array of dimension objects
     * @see getFolders
     */
    var getDimensions = function(projectId) {
        return xhr.get('/gdc/md/' + projectId + '/query/dimensions').then(util.getIn('query.entries'));
    };

    /**
     * Returns project folders. Folders can be of specific types and you can specify
     * the type you need by passing and optional `type` parameter
     *
     * @method getFolders
     * @param {String} projectId - Project identifier
     * @param {String} type - Optional, possible values are `metric`, `fact`, `attribute`
     * @return {Array} An array of dimension objects
     */
    var getFolders = function(projectId, type) {
        var _getFolders = function(projectId, type) {
            var typeURL = type ? '?type='+type : '';

            return xhr.get('/gdc/md/' + projectId + '/query/folders' + typeURL).then(util.getIn('query.entries'));
        };

        switch (type) {
            case 'fact':
            case 'metric':
                return _getFolders(projectId, type);
            case 'attribute':
                return getDimensions(projectId);
            default:
                var d = $.Deferred();
                $.when(_getFolders(projectId, 'fact'),
                       _getFolders(projectId, 'metric'),
                       getDimensions(projectId)).done(function(facts, metrics, attributes) {
                    d.resolve({fact: facts, metric: metrics, attribute: attributes});
                });
                return d.promise();
        }
    };

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
    var getFoldersWithItems = function(projectId, type) {
        var result = $.Deferred();

        // fetch all folders of given type and process them
        getFolders(projectId, type).then(function(folders) {

            // Helper function to get details for each metric in the given
            // array of links to the metadata objects representing the metrics.
            // @return the array of promises
            var getMetricItemsDetails = function(array) {
                var d = $.Deferred();
                $.when.apply(this, array.map(getObjectDetails)).then(function() {
                    var metrics = Array.prototype.slice.call(arguments).map(function(item) {
                        return item.metric;
                    });
                    d.resolve(metrics);
                }, d.reject);
                return d.promise();
            };

            // helper mapBy function
            var mapBy = function(array, key) {
                return array.map(function(item) {
                    return item[key];
                });
            };

            // helper for sorting folder tree structure
            // sadly @returns void (sorting == mutating array in js)
            var sortFolderTree = function(structure) {
                structure.forEach(function(folder) {
                    folder.items.sort(function(a, b) {
                        if(a.meta.title < b.meta.title) {
                            return -1;
                        } else if(a.meta.title > b.meta.title) {
                            return 1;
                        }

                        return 0;
                    });
                });
                structure.sort(function(a, b) {
                    if(a.title < b.title) {
                        return -1;
                    } else if(a.title > b.title) {
                        return 1;
                    }

                    return 0;
                });
            };

            var foldersLinks = mapBy(folders, 'link');
            var foldersTitles = mapBy(folders, 'title');

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
    };

    /**
     * Returns all metrics in a project specified by the given projectId
     *
     * @method getMetrics
     * @param projectId Project identifier
     * @return {Array} An array of metric objects
     */
    var getMetrics = function(projectId) {
        return xhr.get('/gdc/md/' + projectId + '/query/metrics').then(util.getIn('query.entries'));
    };

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
     */
    var getAvailableMetrics = function(projectId, attrs) {
        var d = $.Deferred();

        xhr.post('/gdc/md/'+ projectId +'/availablemetrics', {
            data: JSON.stringify(attrs)
        }).then(function(result) {
            d.resolve(result.entries);
        }, d.reject);

        return d.promise();
    };

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
     */
    var getAvailableAttributes = function(projectId, metrics) {
        var d = $.Deferred();

        xhr.post('/gdc/md/'+ projectId +'/drillcrosspaths', {
            data: JSON.stringify(metrics)
        }).then(function(result) {
            d.resolve(result.drillcrosspath.links);
        }, d.reject);

        return d.promise();
    };

    /**
     * Get details of a metadata object specified by its uri
     *
     * @method getObjectDetails
     * @param uri uri of the metadata object for which details are to be retrieved
     * @return {Object} object details
     */
    var getObjectDetails = function(uri) {
        var d = $.Deferred();

        xhr.get(uri, {
            headers: { Accept: 'application/json' },
            dataType: 'json',
            contentType: 'application/json'
        }).then(function(res) {
            d.resolve(res);
        }, d.reject);

        return d.promise();
    };

    /**
     * Get identifier of a metadata object identified by its uri
     *
     * @method getObjectIdentifier
     * @param uri uri of the metadata object for which the identifier is to be retrieved
     * @return {String} object identifier
     */
    var getObjectIdentifier = function(uri) {
        var obj,
            d = $.Deferred(),
            idFinder = function(obj) {
                if (obj.attribute) {
                    return obj.attribute.content.displayForms[0].meta.identifier;
                } else if (obj.dimension) {
                    return obj.dimension.content.attributes.content.displayForms[0].meta.identifier;
                } else if (obj.metric) {
                    return obj.metric.meta.identifier;
                }

                throw "Unknown object!";
            };

        if (!$.isPlainObject(uri)) {
            getObjectDetails(uri).then(function(data) { d.resolve(idFinder(data)); }, d.reject);
        } else {
            d.resolve(idFinder(obj));
        }

        return d.promise();
    };

    /**
     * Get uri of an metadata object, specified by its identifier and project id it belongs to
     *
     * @method getObjectUri
     * @param projectId id of the project
     * @param identifier identifier of the metadata object
     * @return {String} uri of the metadata object
     */
    var getObjectUri = function(projectId, identifier) {
        var d = $.Deferred(),
            uriFinder = function(obj) {
                var data = (obj.attribute) ? obj.attribute : obj.metric;
                return data.meta.uri;
            };

        xhr.ajax('/gdc/md/'+projectId+'/identifiers', {
            type: 'POST',
            headers: { Accept: 'application/json' },
            data: {
                "identifierToUri": [identifier]
            }
        }).then(function(data) {
            var found = data.identifiers.filter(function(i) {
                return i.identifier === identifier;
            });

            if(found[0]) {
                return getObjectDetails(found[0].uri);
            }

            d.reject('identifier not found');
        }, d.reject).then(function(objData) {
            if (!objData.attributeDisplayForm) {
                return d.resolve(uriFinder(objData));
            } else {
                return getObjectDetails(objData.attributeDisplayForm.content.formOf).then(function(objData) {
                            d.resolve(uriFinder(objData));
                        }, d.reject);
            }
        }, d.reject);

        return d.promise();
    };


    return {
        getAttributes: getAttributes,
        getDimensions: getDimensions,
        getFolders: getFolders,
        getFoldersWithItems: getFoldersWithItems,
        getMetrics: getMetrics,
        getAvailableMetrics: getAvailableMetrics,
        getAvailableAttributes: getAvailableAttributes,
        getObjectDetails: getObjectDetails,
        getObjectIdentifier: getObjectIdentifier,
        getObjectUri: getObjectUri
    };
});

