import { Injectable } from '@nestjs/common';
import GetAllResponseModel from 'src/modules/planning/model/GetAllResponseModel';
import BaseService from '../../BaseService';
import GetByYearAndMonthResponseModel from './model/GetByYearAndMonthResponseModel';
import GetByDateResponseModel from './model/GetByDateResponseModel';
import BlobManagerFactory from 'src/handlers/blob/BlobManagerFactory';
import BlobManagerInterface from 'src/handlers/blob/BlobManagerInterface';

@Injectable()
export default class PlanningService extends BaseService {
    private readonly blobManager: BlobManagerInterface;

    constructor() {
        super();
        this.blobManager = BlobManagerFactory.createManager()
    }

    async getAll(): Promise<GetAllResponseModel> {
        const calendarBuffer = await this.blobManager.read("calendar.json");
        const calendarStr = calendarBuffer.toString('binary');
        const calendar = JSON.parse(calendarStr);

        const response: GetAllResponseModel = { items: calendar };

        return Promise.resolve(response);
    }

    async getByYearAndMonth(
        year: number,
        month: number,
    ): Promise<GetByYearAndMonthResponseModel> {
        const calendarBuffer = await this.blobManager.read("calendar.json");
        const calendarStr = calendarBuffer.toString('binary');
        const calendar = JSON.parse(calendarStr);

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
        const calendarBuffer = await this.blobManager.read("calendar.json");
        const calendarStr = calendarBuffer.toString('binary');
        const calendar = JSON.parse(calendarStr);

        const selectedYear = calendar?.[year];
        const selectedMonth = selectedYear?.[month];
        const selectedDay: string[] = selectedMonth?.[day];

        const response = new GetByDateResponseModel(selectedDay ?? []);

        return Promise.resolve(response);
    }
}
