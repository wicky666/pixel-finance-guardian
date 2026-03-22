import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { UpdateAdminSettingsDto } from "./dto/update-admin-settings.dto";
import { AdminService } from "./admin.service";

@Controller("admin")
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
}
