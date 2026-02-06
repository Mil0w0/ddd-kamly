import { Module } from '@nestjs/common';
import { ClientsModule } from './clients/clients.module';
import { InterventionsModule } from './interventions/interventions.module';

@Module({
  imports: [ClientsModule, InterventionsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
