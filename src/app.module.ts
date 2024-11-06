import { Module } from '@nestjs/common';
import { AssistantModule } from './assistant.module';
import { TasksModule } from './tasks.module';
import { PlanningModule } from './planning.module';

@Module({
    imports: [AssistantModule, TasksModule, PlanningModule],
})
export class AppModule {}
