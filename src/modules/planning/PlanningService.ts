import { Injectable } from '@nestjs/common';
import GetAllResponseModel from 'src/modules/planning/model/GetAllResponseModel';
import BaseService from '../../BaseService';
import calendar from './calendar.json';
import GetByYearAndMonthResponseModel from './model/GetByYearAndMonthResponseModel';
import GetByDateResponseModel from './model/GetByDateResponseModel';

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

    async getByDate(
        year: number,
        month: number,
        day: number,
    ): Promise<GetByDateResponseModel> {
        const selectedYear = calendar[year];
        const selectedMonth = selectedYear[month];
        const selectedDay: string[] = selectedMonth[day];

        const response = new GetByDateResponseModel(selectedDay);

        return Promise.resolve(response);
    }
}
