import { Injectable } from '@nestjs/common';
import GetAllEntriesResponseModel from 'src/modules/planning/model/GetAllEntriesResponseModel';
import BaseService from '../../BaseService';
import GetEntriesByYearAndMonthResponseModel from './model/GetEntriesByYearAndMonthResponseModel';
import GetEntryByDateResponseModel from './model/GetEntryByDateResponseModel';
import BlobManagerFactory from 'src/handlers/blob/BlobManagerFactory';
import BlobManagerInterface from 'src/handlers/blob/BlobManagerInterface';
import InsertEntryResponseModel from './model/InsertEntryResponseModel';

@Injectable()
export default class PlanningService extends BaseService {
    private readonly blobManager: BlobManagerInterface;
    private readonly calendar: Record<
        string,
        Record<string, Record<string, string[]>>
    > = { '2024': { '11': { '08': ['Testandoooo'] } } };

    constructor() {
        super();
        this.blobManager = BlobManagerFactory.createManager();
    }

    async getAllEntries(): Promise<GetAllEntriesResponseModel> {
        // const calendarBuffer = await this.blobManager.read("calendar.json");
        // const calendarStr = calendarBuffer.toString('binary');
        // const calendar = JSON.parse(calendarStr);

        const response: GetAllEntriesResponseModel = { items: this.calendar };

        return Promise.resolve(response);
    }

    async getEntriesByYearAndMonth(
        year: number,
        month: number,
    ): Promise<GetEntriesByYearAndMonthResponseModel> {
        // const calendarBuffer = await this.blobManager.read("calendar.json");
        // const calendarStr = calendarBuffer.toString('binary');
        // const calendar = JSON.parse(calendarStr);

        const selectedYear = this.calendar[year];
        const selectedMonth: Record<string, string[]> = selectedYear?.[month];

        const response = new GetEntriesByYearAndMonthResponseModel(
            selectedMonth ?? {},
        );

        return Promise.resolve(response);
    }

    async getEntriesByDate(
        year: number,
        month: number,
        day: number,
    ): Promise<GetEntryByDateResponseModel> {
        // const calendarBuffer = await this.blobManager.read("calendar.json");
        // const calendarStr = calendarBuffer.toString('binary');
        // const calendar = JSON.parse(calendarStr);

        const selectedYear = this.calendar?.[year];
        const selectedMonth = selectedYear?.[month];
        const selectedDay: string[] = selectedMonth?.[day];

        const response = new GetEntryByDateResponseModel(selectedDay ?? []);

        return Promise.resolve(response);
    }

    async saveEntry(
        year: number,
        month: number,
        day: number,
        entries: string[],
    ): Promise<InsertEntryResponseModel> {
        // const CALENDAR_FILE_NAME = "calendar.json";

        // const calendarBuffer = await this.blobManager.read(CALENDAR_FILE_NAME);
        // const calendarStr = calendarBuffer.toString('binary');
        // const calendar = JSON.parse(calendarStr);

        this.calendar[year][month][day] = entries;

        console.log(this.calendar);
        // It wouldn't be ok of the file was already locked by a mutex for example
        const response = new InsertEntryResponseModel('ok');

        return Promise.resolve(response);
    }
}
