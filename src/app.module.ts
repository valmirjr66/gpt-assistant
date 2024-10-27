import { Module } from '@nestjs/common';
import { AssistantModule } from './assistant.module';
import { TasksModule } from './tasks.module';

@Module({
    imports: [AssistantModule, TasksModule],
})
export class AppModule {}
