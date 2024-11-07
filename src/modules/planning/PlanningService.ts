import { Injectable } from '@nestjs/common';
import GetPlanningResponseModel from 'src/modules/planning/model/GetPlanningResponseModel';
import BaseService from '../../BaseService';
import calendar from './calendar.json';

@Injectable()
export default class PlanningService extends BaseService {
    constructor() {
        super();
    }

    async getAll(): Promise<GetPlanningResponseModel> {
        const response: GetPlanningResponseModel = { items: calendar };

        return Promise.resolve(response);
    }
}
