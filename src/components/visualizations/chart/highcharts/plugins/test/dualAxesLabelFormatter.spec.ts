// (C) 2007-2018 GoodData Corporation
import { removeDecimal, roundNumber } from '../dualAxesLabelFormatter';

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
