import { Module } from '@nestjs/common';
import PlanningController from './modules/planning/PlanningController';
import PlanningService from './modules/planning/PlanningService';

@Module({
    controllers: [PlanningController],
    providers: [PlanningService],
})
export class PlanningModule {}
