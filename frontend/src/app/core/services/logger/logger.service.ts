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
      console.log(`[${loggedBy}]: ${message}`, ...optional);
  }

  warn(loggedBy: LoggerType, message: string, ...optional: any[]) {
    if (!this.disabledLoggers.includes(loggedBy))
      console.warn(`[${loggedBy}]: ${message}`, ...optional);
  }

  error(loggedBy: LoggerType, message: string, ...optional: any[]) {
    if (!this.disabledLoggers.includes(loggedBy))
      console.error(`[${loggedBy}]: ${message}`, ...optional);
  }
}
