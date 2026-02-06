import { Module } from '@nestjs/common';
import { InterventionsModule } from './interventions/interventions.module';

@Module({
  imports: [InterventionsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
