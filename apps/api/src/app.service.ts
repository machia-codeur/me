import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getStatus() {
    return { status: "ok", name: "COWRI API", version: "0.0.1" };
  }
}
