import { getProjectIdByUri } from '../project';

describe('getProjectId', () => {
    it('should extract project id from relative uri', () => {
        expect(getProjectIdByUri('/gdc/md/aadsf234234234324/obj/123')).toBe('aadsf234234234324');
    });

    it('should throw if project id is not found', () => {
        expect(() => getProjectIdByUri('/uri/without/projectid')).toThrow();
    });
});
