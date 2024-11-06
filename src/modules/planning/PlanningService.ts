import { Injectable } from '@nestjs/common';
import GetPlanningResponseModel from 'src/modules/planning/model/GetPlanningResponseModel';
import BaseService from '../../BaseService';

@Injectable()
export default class PlanningService extends BaseService {
    constructor() {
        super();
    }

    async getAll(): Promise<GetPlanningResponseModel> {
        const response: GetPlanningResponseModel = {
            items: {
                '2024-11-20': [
                    'Sample text 1',
                    'Sample text 2',
                    'Sample text 3',
                ],
                '2024-11-25': [
                    'That is a larger sample text intended to verify the concept',
                ],
            },
        };

        return Promise.resolve(response);
    }
}
