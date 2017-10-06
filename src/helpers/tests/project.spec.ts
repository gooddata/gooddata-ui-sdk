import { getProjectIdByUri } from '../project';

describe('getProjectId', () => {
    it('should extract project id from relative uri', () => {
        expect(getProjectIdByUri('/gdc/md/aadsf234234234324/obj/123')).toBe('aadsf234234234324');
    });

    it('should throw error if cannot get project id from given uri', () => {
        expect(() => getProjectIdByUri('/uri/without/projectid')).toThrow();
    });
});
