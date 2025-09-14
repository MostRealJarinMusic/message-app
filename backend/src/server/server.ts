import express from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import { errorHandler } from "../middleware/error-handler";
import { DB } from "../db/db";
import { Repos, Services } from "../types/types";
import { createRepos } from "../db/factories/repo.factory";
import { WebSocketManager } from "../websocket/websocket-manager";
import { createRoutes } from "../routes/factories/route.factory";
import { createServices } from "../services/factories/service.factory";
import { EventBus } from "../websocket/event-bus";
import { ConnectionRegistry } from "../websocket/connection-registry";
import { WebSocketRouter } from "../websocket/websocket-router";
import { NotificationDispatcher } from "../websocket/notification-dispatcher";

export class Server {
  private app = express();
  private server = http.createServer(this.app);
  private wsManager!: WebSocketManager;
  private wsRouter!: WebSocketRouter;
  private connectionRegistry!: ConnectionRegistry;
  private notificationDispatcher!: NotificationDispatcher;
  private db!: DB;

  private eventBus!: EventBus;
  private repos!: Repos;
  private services!: Services;

  constructor() {
    this.app.use(cors());
    this.app.use(bodyParser.json());
  }

  async init() {
    this.db = new DB();
    await this.db.init();

    // Initialise repos
    this.repos = createRepos(this.db);

    // Initialise event bus + connection registry
    this.eventBus = new EventBus();
    this.connectionRegistry = new ConnectionRegistry();

    // Initialise services
    this.services = createServices(
      this.repos,
      this.eventBus,
      this.connectionRegistry
    );

    // Initialise WebSocket manager
    this.wsRouter = new WebSocketRouter(
      this.services.typing,
      this.connectionRegistry
    );

    this.wsManager = new WebSocketManager(
      this.services.auth,
      this.services.heartbeat,
      this.services.presence,
      this.connectionRegistry,
      this.wsRouter
    );
    this.wsManager.init(this.server);

    // Initialise notification dispatcher
    this.notificationDispatcher = new NotificationDispatcher(
      this.services.relevance,
      this.wsManager,
      this.eventBus
    );
    this.notificationDispatcher.init();

    // Register routes
    createRoutes(this.app, this.services);

    // Error handler
    this.app.use(errorHandler);
  }

  start(port: number) {
    this.server.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  }
}
