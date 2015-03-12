// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
define(['./xhr', './util'], function(xhr, util) {
    'use strict';

    /**
     * Functions for working with projects
     *
     * @class project
     * @module project
     */


    /**
     * Get current project id
     *
     * @method getCurrentProjectId
     * @return {String} current project identifier
     */
    var getCurrentProjectId = function() {
        return xhr.get('/gdc/app/account/bootstrap').then(function(result) {
            var currentProject = result.bootstrapResource.current.project;
            // handle situation in which current project is missing (e.g. new user)
            if (!currentProject) {
                return null;
            }

            return result.bootstrapResource.current.project.links.self.split('/').pop();
        });
    };

   /**
     * Fetches projects available for the user represented by the given profileId
     *
     * @method getProjects
     * @param {String} profileId - User profile identifier
     * @return {Array} An Array of projects
     */
    var getProjects = function(profileId) {
        return xhr.get('/gdc/account/profile/' + profileId + '/projects').then(function(result) {
            return result.projects.map(function(p) { return p.project; });
        });
    };

    /**
     * Fetches all datasets for the given project
     *
     * @method getDatasets
     * @param {String} projectId - GD project identifier
     * @return {Array} An array of objects containing datasets metadata
     */
    var getDatasets = function(projectId) {
        return xhr.get('/gdc/md/' + projectId + '/query/datasets').then(util.getIn('query.entries'));
    };

    var DEFAULT_PALETTE = [
        {r:0x2b, g:0x6b, b:0xae},
        {r:0x69, g:0xaa, b:0x51},
        {r:0xee, g:0xb1, b:0x4c},
        {r:0xd5, g:0x3c, b:0x38},
        {r:0x89, g:0x4d, b:0x94},
        {r:0x73, g:0x73, b:0x73},
        {r:0x44, g:0xa9, b:0xbe},
        {r:0x96, g:0xbd, b:0x5f},
        {r:0xfd, g:0x93, b:0x69},
        {r:0xe1, g:0x5d, b:0x86},
        {r:0x7c, g:0x6f, b:0xad},
        {r:0xa5, g:0xa5, b:0xa5},
        {r:0x7a, g:0xa6, b:0xd5},
        {r:0x82, g:0xd0, b:0x8d},
        {r:0xff, g:0xd2, b:0x89},
        {r:0xf1, g:0x84, b:0x80},
        {r:0xbf, g:0x90, b:0xc6},
        {r:0xbf, g:0xbf, b:0xbf}
    ];

    /**
     * Fetches a chart color palette for a project represented by the given
     * projectId parameter.
     *
     * @method getColorPalette
     * @param {String} projectId - A project identifier
     * @return {Array} An array of objects with r, g, b fields representing a project's
     * color palette
     */
    var getColorPalette = function(projectId) {
        var d = $.Deferred();

        xhr.get('/gdc/projects/'+ projectId +'/styleSettings').then(function(result) {
            d.resolve(result.styleSettings.chartPalette.map(function(c) {
                return {
                    r: c.fill.r,
                    g: c.fill.g,
                    b: c.fill.b
                };
            }));
        }, function(err) {
            if (err.status === 200) {
                d.resolve(DEFAULT_PALETTE);
            }
            d.reject(err);
        });

        return d.promise();
    };

    /**
     * Sets given colors as a color palette for a given project.
     *
     * @method setColorPalette
     * @param {String} projectId - GD project identifier
     * @param {Array} colors - An array of colors that we want to use within the project.
     * Each color should be an object with r, g, b fields.
     */
    var setColorPalette = function(projectId, colors) {
        var d = $.Deferred();

        xhr.put('/gdc/projects/'+ projectId +'/styleSettings', {
            data:  {
                styleSettings: {
                    chartPalette: colors.map(function(c, idx) {
                        return {
                            guid: 'guid'+idx,
                            fill: c
                        };
                    })
                }
            }
        }).then(d.resolve, d.reject);

        return d.promise();
    };

    /**
     * Gets current timezone and its offset. Example output:
     *
     *     {
     *         id: 'Europe/Prague',
     *         displayName: 'Central European Time',
     *         currentOffsetMs: 3600000
     *     }
     *
     * @method getTimezone
     * @param {String} projectId - GD project identifier
     */
    var getTimezone = function(projectId) {
        var d = $.Deferred(),
            bootstrapUrl = '/gdc/app/account/bootstrap?projectId=' + projectId;

        xhr.get(bootstrapUrl).then(function(result) {
            var timezone = result.bootstrapResource.current.timezone;
            d.resolve(timezone);
        }, d.reject);

        return d.promise();
    };

    var setTimezone = function(projectId, timezone) {
        var d = $.Deferred(),
            timezoneServiceUrl = '/gdc/md/' + projectId + '/service/timezone',
            data = {
                service: { timezone: timezone }
            };

        xhr.ajax(timezoneServiceUrl, {
            type: 'POST',
            headers: { Accept: 'application/json' },
            data: data
        }).then(d.resolve, d.reject);

        return d.promise();
    };

    return {
        getCurrentProjectId: getCurrentProjectId,
        getProjects: getProjects,
        getDatasets: getDatasets,
        getColorPalette: getColorPalette,
        setColorPalette: setColorPalette,
        getTimezone: getTimezone,
        setTimezone: setTimezone,
        DEFAULT_PALETTE: DEFAULT_PALETTE
    };
});

