import { Module } from '@nestjs/common';
import { ArtifactsModule } from './artifacts.module';
import { AssistantModule } from './assistant.module';
import { PlanningModule } from './planning.module';

@Module({
    imports: [AssistantModule, PlanningModule, ArtifactsModule],
})
export class AppModule { }
