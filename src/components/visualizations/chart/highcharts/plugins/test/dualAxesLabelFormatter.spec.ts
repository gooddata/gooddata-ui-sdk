// (C) 2007-2018 GoodData Corporation
import { removeDecimal, roundNumber, formatValueInShallowRange } from '../dualAxesLabelFormatter';

describe('dual axes label format', () => {

    it('test remove decimal', () => {
        let value = removeDecimal('1');
        expect(value).toEqual('1');

        value = removeDecimal('1.1');
        expect(value).toEqual('1.1');

        value = removeDecimal('1.1111');
        expect(value).toEqual('1.1');

        value = removeDecimal('11');
        expect(value).toEqual('11');

        value = removeDecimal('11.1111');
        expect(value).toEqual('11.1');

        value = removeDecimal('111.1111');
        expect(value).toEqual('111.1');

        value = removeDecimal('1111.1111');
        expect(value).toEqual('1111');
    });

    describe('test format value in shallow range', () => {
        it('min=0, max=1', () => {
            const min = 0;
            const max = 1;
            let value = formatValueInShallowRange(0.39375000000000004, min, max);
            expect(value).toEqual(0.39);

            value = formatValueInShallowRange(0.525, min , max);
            expect(value).toEqual(0.52);

            value = formatValueInShallowRange(0.7, min , max);
            expect(value).toEqual(0.7);
        });

        it('min=0, max=0.1', () => {
            const min = 0;
            const max = 0.1;
            let value = formatValueInShallowRange(0.0125, min, max);
            expect(value).toEqual(0.012);

            value = formatValueInShallowRange(0.037500000000000006, min, max);
            expect(value).toEqual(0.037);

            value = formatValueInShallowRange(0.1, min, max);
            expect(value).toEqual(0.1);
        });

        it('min=0, max=0.001', () => {
            const min = 0;
            const max = 0.001;
            let value = formatValueInShallowRange(0.000125, min, max);
            expect(value).toEqual(0.00012);

            value = formatValueInShallowRange(0.00050, min, max);
            expect(value).toEqual(0.00050);
        });

        it('min=11, max=12', () => {
            const min = 11;
            const max = 12;
            let value = formatValueInShallowRange(11.39375000000000004, min, max);
            expect(value).toEqual(11.39);

            value = formatValueInShallowRange(11.525, min , max);
            expect(value).toEqual(11.52);

            value = formatValueInShallowRange(11.7, min , max);
            expect(value).toEqual(11.7);
        });
    });

    describe('test round number', () => {
        it('(max - min) <= 100', () => {
            let value = roundNumber('1', -50, 50);
            expect(value).toEqual(1);

            value = roundNumber('1.1', -50, 50);
            expect(value).toEqual(1.1);

            value = roundNumber('11.1', -50, 50);
            expect(value).toEqual(11.1);

            value = roundNumber('111.1', -50, 50);
            expect(value).toEqual(111.1);
        });

        it('(max - min) <= 1000', () => {
            let value = roundNumber('500', -500, 500);
            expect(value).toEqual(500);

            value = roundNumber('1111.1', -500, 500);
            expect(value).toEqual(1100);
        });

        it('(max - min) <= 10000', () => {
            let value = roundNumber('12345', 0, 10000);
            expect(value).toEqual(12300);

            value = roundNumber('98765', 0, 10000);
            expect(value).toEqual(98800);
        });

        it('(max - min) <= 100000', () => {
            let value = roundNumber('123456', 0, 100000);
            expect(value).toEqual(123500);

            value = roundNumber('987654', 0, 100000);
            expect(value).toEqual(987700);
        });

        it('big number and small range', () => {
            let value = roundNumber('26123', 26000, 27000);
            expect(value).toEqual(26100);

            value = roundNumber('27999', 26000, 27000);
            expect(value).toEqual(28000);
        });
    });
});
