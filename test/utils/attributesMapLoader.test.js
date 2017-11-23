import { loadAttributesMap } from '../../src/utils/attributesMapLoader';
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
            expect(attributesMap).toEqual(fixtures.expectedResult)
        );
    });
});
