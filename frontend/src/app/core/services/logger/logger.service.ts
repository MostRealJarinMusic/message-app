import { Injectable } from '@angular/core';
import { LoggerType } from '@common/types';

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private disabledLoggers: LoggerType[] = [];
  //   LoggerType.SERVICE_SERVER,
  //   LoggerType.SERVICE_CHANNEL,
  //   LoggerType.SERVICE_CATEGORY,
  //   LoggerType.SERVICE_MESSAGE,
  //   LoggerType.SERVICE_USER,
  //   LoggerType.SERVICE_PRESENCE,
  //   LoggerType.SERVICE_SOCKET,
  // ];

  log(loggedBy: LoggerType, message: string, ...optional: any[]) {
    if (!this.disabledLoggers.includes(loggedBy))
      console.log(`%c[${loggedBy}]: ${message}`, 'color: lightblue;', ...optional);
  }

  warn(loggedBy: LoggerType, message: string, ...optional: any[]) {
    if (!this.disabledLoggers.includes(loggedBy)) {
      console.warn(`%c[${loggedBy}]: ${message}`, 'color: orange;', ...optional);
    }
  }

  error(loggedBy: LoggerType, message: string, ...optional: any[]) {
    if (!this.disabledLoggers.includes(loggedBy)) {
      console.error(`%c[${loggedBy}]: ${message}`, 'color: red;', ...optional);
    }
  }
}
