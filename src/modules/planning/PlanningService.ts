import { Injectable } from '@nestjs/common';
import GetAllResponseModel from 'src/modules/planning/model/GetAllResponseModel';
import BaseService from '../../BaseService';
import calendar from './calendar.json';
import GetByYearAndMonthResponseModel from './model/GetByYearAndMonthResponseModel';

@Injectable()
export default class PlanningService extends BaseService {
    constructor() {
        super();
    }

    async getAll(): Promise<GetAllResponseModel> {
        const response: GetAllResponseModel = { items: calendar };

        return Promise.resolve(response);
    }

    async getByYearAndMonth(
        year: number,
        month: number,
    ): Promise<GetByYearAndMonthResponseModel> {
        const selectedYear = calendar[year];
        const selectedMonth: Record<string, string[]> = selectedYear[month];

        const response = new GetByYearAndMonthResponseModel(selectedMonth);

        return Promise.resolve(response);
    }
}
