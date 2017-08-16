// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
import fetchMock from '../utils/fetch-mock';
import * as contracts from '../../src/admin/contracts';

describe('contracts', () => {
    describe('with fake server', () => {
        describe('getUserContracts', () => {
            const contractsPayload = JSON.stringify({
                contracts: {
                    items: [
                        {
                            contract: {
                                id: 'contractId1'
                            }
                        },
                        {
                            contract: {
                                id: 'contractId2'
                            }
                        }
                    ],
                    paging: {

                    }
                }
            });

            it('should return users contracts', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts',
                    {
                        status: 200,
                        body: contractsPayload
                    }
                );

                return contracts.getUserContracts().then((result) => {
                    expect(result.items.length).to.be(2);
                    expect(result.items[0].id).to.be('contractId1');
                    expect(result.items[1].id).to.be('contractId2');
                });
            });
        });
    });
});
