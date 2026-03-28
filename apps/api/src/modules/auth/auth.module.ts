import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { RolesGuard } from "./roles.guard";
import { AuthRepository } from "./auth.repository";

@Module({
  controllers: [AuthController],
  providers: [AuthRepository, AuthService, RolesGuard],

@Module({
  controllers: [AuthController],
  providers: [AuthService, RolesGuard],
  exports: [AuthService, RolesGuard],
})
export class AuthModule {}
