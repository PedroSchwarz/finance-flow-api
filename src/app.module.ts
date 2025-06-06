import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule], inject: [ConfigService], useFactory: (config: ConfigService) => {
        const url = config.get<string>('DATABASE_URL') ?? '';
        const name = config.get<string>('DATABASE_NAME') ?? '';
        const user = config.get<string>('DATABASE_USER') ?? '';
        const password = config.get<string>('DATABASE_PASSWORD') ?? '';
        return { uri: `mongodb+srv://${user}:${password}@${url}/?retryWrites=true&w=majority&appName=${name}` };
      }
    }),
    AuthModule,
    UsersModule,
  ],
})
export class AppModule { }
