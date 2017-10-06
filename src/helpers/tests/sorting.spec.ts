import { ISortingChange, getSorting, COLUMN_TYPE_METRIC, COLUMN_TYPE_ATTRIBUTE } from '../sorting';
import { Transformation } from '@gooddata/data-layer';

describe('getColumn', () => {
    function getChange(type: string): ISortingChange {
        return {
            type,
            id: 'object id',
            title: 'Object title',
            uri: '/gdc/md/project/obj/1'
        };
    }

    function getPrevSorting(column: string, direction: string): Transformation.ISort {
        return { column, direction };
    }

    it('should return asc by default for attribute', () => {
        expect(getSorting(getChange(COLUMN_TYPE_ATTRIBUTE), null)).toEqual({
            column: '/gdc/md/project/obj/1',
            direction: 'asc'
        });
    });

    it('should return desc by default for measure', () => {
        expect(getSorting(getChange(COLUMN_TYPE_METRIC), null)).toEqual({
            column: 'object id',
            direction: 'desc'
        });
    });

    it('should return desc for measure if prev sorted by another column', () => {
        const sorting = getSorting(
            getChange(COLUMN_TYPE_METRIC),
            getPrevSorting('another object id', 'asc')
        );

        expect(sorting).toEqual({ column: 'object id', direction: 'desc' });
    });

    it('should return asc for attribute if prev sorted by another column', () => {
        const sorting = getSorting(
            getChange(COLUMN_TYPE_ATTRIBUTE),
            getPrevSorting('another object id', 'asc')
        );

        expect(sorting).toEqual({ column: '/gdc/md/project/obj/1', direction: 'asc' });
    });

    it('should return asc if prev sorted descendingly', () => {
        const sorting = getSorting(
            getChange(COLUMN_TYPE_METRIC),
            getPrevSorting('object id', 'desc')
        );

        expect(sorting).toEqual({ column: 'object id', direction: 'asc' });
    });

    it('should return desc if prev sorted ascendingly', () => {
        const sorting = getSorting(
            getChange(COLUMN_TYPE_METRIC),
            getPrevSorting('object id', 'asc')
        );

        expect(sorting).toEqual({ column: 'object id', direction: 'desc' });
    });
});
