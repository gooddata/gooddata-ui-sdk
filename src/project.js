// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
import { ajax, get, put, parseJSON } from './xhr';
import { getIn } from './util';

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
export function getCurrentProjectId() {
    return get('/gdc/app/account/bootstrap').then(result => {
        const currentProject = result.bootstrapResource.current.project;
        // handle situation in which current project is missing (e.g. new user)
        if (!currentProject) {
            return null;
        }

        return result.bootstrapResource.current.project.links.self.split('/').pop();
    });
}

/**
 * Fetches projects available for the user represented by the given profileId
 *
 * @method getProjects
 * @param {String} profileId - User profile identifier
 * @return {Array} An Array of projects
 */
export function getProjects(profileId) {
    return get('/gdc/account/profile/' + profileId + '/projects').then((r) => {
        return r.projects.map(p => p.project);
    });
}

/**
 * Fetches all datasets for the given project
 *
 * @method getDatasets
 * @param {String} projectId - GD project identifier
 * @return {Array} An array of objects containing datasets metadata
 */
export function getDatasets(projectId) {
    return get('/gdc/md/' + projectId + '/query/datasets').then(getIn('query.entries'));
}

const DEFAULT_PALETTE = [
    {r: 0x2b, g: 0x6b, b: 0xae},
    {r: 0x69, g: 0xaa, b: 0x51},
    {r: 0xee, g: 0xb1, b: 0x4c},
    {r: 0xd5, g: 0x3c, b: 0x38},
    {r: 0x89, g: 0x4d, b: 0x94},
    {r: 0x73, g: 0x73, b: 0x73},
    {r: 0x44, g: 0xa9, b: 0xbe},
    {r: 0x96, g: 0xbd, b: 0x5f},
    {r: 0xfd, g: 0x93, b: 0x69},
    {r: 0xe1, g: 0x5d, b: 0x86},
    {r: 0x7c, g: 0x6f, b: 0xad},
    {r: 0xa5, g: 0xa5, b: 0xa5},
    {r: 0x7a, g: 0xa6, b: 0xd5},
    {r: 0x82, g: 0xd0, b: 0x8d},
    {r: 0xff, g: 0xd2, b: 0x89},
    {r: 0xf1, g: 0x84, b: 0x80},
    {r: 0xbf, g: 0x90, b: 0xc6},
    {r: 0xbf, g: 0xbf, b: 0xbf}
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
export function getColorPalette(projectId) {
    return get('/gdc/projects/' + projectId + '/styleSettings').then((result) => {
        return result.styleSettings.chartPalette.map(c => {
            return {
                r: c.fill.r,
                g: c.fill.g,
                b: c.fill.b
            };
        });
    }, (err) => {
        if (err.status === 200) {
            return DEFAULT_PALETTE;
        }

        throw new Error(err.statusText);
    });
}

/**
 * Sets given colors as a color palette for a given project.
 *
 * @method setColorPalette
 * @param {String} projectId - GD project identifier
 * @param {Array} colors - An array of colors that we want to use within the project.
 * Each color should be an object with r, g, b fields.
 */
export function setColorPalette(projectId, colors) {
    return put('/gdc/projects/' + projectId + '/styleSettings', {
        data: {
            styleSettings: {
                chartPalette: colors.map((fill, idx) => {
                    return { fill, guid: `guid${idx}` };
                })
            }
        }
    });
}

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
export function getTimezone(projectId) {
    const bootstrapUrl = '/gdc/app/account/bootstrap?projectId=' + projectId;

    return get(bootstrapUrl).then(result => {
        return result.bootstrapResource.current.timezone;
    });
}

export function setTimezone(projectId, timezone) {
    const timezoneServiceUrl = '/gdc/md/' + projectId + '/service/timezone';
    const data = {
        service: { timezone: timezone }
    };

    return ajax(timezoneServiceUrl, {
        method: 'POST',
        body: data
    }).then(parseJSON);
}

