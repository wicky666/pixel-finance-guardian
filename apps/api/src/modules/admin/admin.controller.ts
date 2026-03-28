import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { UpdateAdminSettingsDto } from "./dto/update-admin-settings.dto";
import { AdminService } from "./admin.service";
import { AuthGuard } from "../auth/auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import type { SafeUser, UserRole } from "../auth/auth.types";

@Controller("admin")
@UseGuards(AuthGuard, RolesGuard)
@Roles("admin", "super_admin")
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get("overview")
  overview() {
    return this.admin.getOverview();
  }

  @Get("settings")
  settings() {
    return this.admin.getSettings();
  }

  @Patch("settings")
  updateSettings(@Body() body: UpdateAdminSettingsDto) {
    return this.admin.updateSettings(body);
  }

  @Get("jobs")
  jobs() {
    return { items: this.admin.getJobs() };
  }

  @Post("jobs/:id/run")
  runJob(@Param("id") id: string) {
    try {
      return { item: this.admin.runJob(id) };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : "任务执行失败"
      );
    }
  }

  @Get("activity")
  activity(@Query("limit") limit?: string) {
    const safeLimit = Number.isFinite(Number(limit)) ? Number(limit) : 20;
    return { items: this.admin.getActivity(safeLimit) };
  }

  @Get("users")
  listUsers() {
    return { items: this.admin.listUsers() };
  }

  @Post("users/:id/role")
  @Roles("super_admin")
  updateUserRole(
    @Req() req: Request & { user: SafeUser },
    @Param("id") id: string,
    @Body() body: { role: UserRole }
  ) {
    return { item: this.admin.updateUserRole(req.user, id, body.role) };
  }

  @Post("users/:id/status")
  updateUserStatus(
    @Req() req: Request & { user: SafeUser },
    @Param("id") id: string,
    @Body() body: { status: "active" | "blocked" }
  ) {
    return { item: this.admin.updateUserStatus(req.user, id, body.status) };
  }
}
