import {
    loadAttributesMap,
    getMissingUrisInAttributesMap
} from '../../src/utils/attributesMapLoader';

import fetchMock from './fetch-mock';
import * as fixtures from '../fixtures/attributesMapLoader';

describe('loadAttributesMap', () => {
    const projectId = 'mockProject';

    function setupFetchMock() {
        let callCount = 0;
        const twoCallsMatcher = () => {
            if (callCount === 0) {
                callCount = 1;
                return {
                    status: 200,
                    body: JSON.stringify({
                        objects: {
                            items: fixtures.displayForms
                        }
                    })
                };
            }

            return {
                status: 200,
                body: JSON.stringify({
                    objects: {
                        items: fixtures.attributeObjects
                    }
                })
            };
        };
        fetchMock.mock(
            `/gdc/md/${projectId}/objects/get`,
            twoCallsMatcher
        );
    }

    afterEach(() => {
        fetchMock.restore();
    });

    it('returns empty map for empty list of URIs', () => {
        return loadAttributesMap(projectId, []).then(attributesMap =>
            expect(attributesMap).toEqual({})
        );
    });

    it('returns map with keys generated from input URIs', () => {
        const URIs = [`/gdc/internal/projects/${projectId}/1028`, `/gdc/internal/projects/${projectId}/43`];

        setupFetchMock();

        return loadAttributesMap(projectId, URIs).then(attributesMap =>
            expect(attributesMap).toEqual(fixtures.attributesMap)
        );
    });
});

describe('getMissingUrisInAttributesMap', () => {
    it('should return all uris in displayforms uris', () => {
        expect(getMissingUrisInAttributesMap(fixtures.displayFormUris, {}))
            .toEqual(fixtures.displayFormUris);
    });

    it('should return only one missing uri', () => {
        const attributesMap = {
            '/gdc/md/mockProject/obj/1028': {}
        };

        expect(getMissingUrisInAttributesMap(fixtures.displayFormUris, attributesMap))
            .toEqual(['/gdc/md/mockProject/obj/43']);
    });

    it('should return empty array when all uris are present in attributes map', () => {
        const attributesMap = {
            '/gdc/md/mockProject/obj/1028': {},
            '/gdc/md/mockProject/obj/43': {}
        };

        expect(getMissingUrisInAttributesMap(fixtures.displayFormUris, attributesMap))
            .toEqual([]);
    });

    it('should return empty array when displayforms uris are empty', () => {
        const attributesMap = {
            '/gdc/md/mockProject/obj/1028': {},
            '/gdc/md/mockProject/obj/43': {}
        };

        expect(getMissingUrisInAttributesMap([], attributesMap))
            .toEqual([]);
    });
});
