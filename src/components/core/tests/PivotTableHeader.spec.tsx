import {
    getSorting,
    getNextSorting
} from '../PivotTableHeader';

const ASC = 'asc';
const DESC = 'desc';
const mockColumn = (isAsc: boolean, isDesc: boolean, colId = 'a_1234') => ({
    isSortAscending: () => isAsc,
    isSortDescending: () => isDesc,
    getColId: () => colId
});
describe('getSorting', () => {
    it('should return next sorting state', () => {
        expect(getSorting(mockColumn(false, false))).toBe(null);
        expect(getSorting(mockColumn(true, false))).toBe(ASC);
        expect(getSorting(mockColumn(false, true))).toBe(DESC);
    });
});

describe('getNextSorting', () => {
    it('should return next sorting state', () => {
        // row attribute column
        expect(getNextSorting(mockColumn(false, false, 'a_1234'))).toBe(ASC);
        expect(getNextSorting(mockColumn(false, true, 'a_1234'))).toBe(ASC);
        expect(getNextSorting(mockColumn(true, false, 'a_1234'))).toBe(DESC);

        // measure without column attributes
        expect(getNextSorting(mockColumn(false, false, 'm_1'))).toBe(DESC);
        expect(getNextSorting(mockColumn(false, true, 'm_1'))).toBe(ASC);
        expect(getNextSorting(mockColumn(true, false, 'm_1'))).toBe(DESC);

        // measure with column attributes
        expect(getNextSorting(mockColumn(false, false, 'a_1234-m_1'))).toBe(DESC);
        expect(getNextSorting(mockColumn(false, true, 'a_1234-m_1'))).toBe(ASC);
        expect(getNextSorting(mockColumn(true, false, 'a_1234-m_1'))).toBe(DESC);
    });
});
