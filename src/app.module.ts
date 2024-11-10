import { Module } from '@nestjs/common';
import { ArtifactsModule } from './artifacts.module';
import { AssistantModule } from './assistant.module';
import { PlanningModule } from './planning.module';
import { TasksModule } from './tasks.module';

@Module({
    imports: [AssistantModule, TasksModule, PlanningModule, ArtifactsModule],
})
export class AppModule {}
