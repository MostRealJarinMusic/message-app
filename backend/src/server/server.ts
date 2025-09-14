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

export class Server {
  private app = express();
  private server = http.createServer(this.app);
  private wsManager!: WebSocketManager;
  private connectionRegistry!: ConnectionRegistry;
  private db!: DB;

  private eventBus!: EventBus;
  private repos!: Repos;
  private services!: Services;

  constructor() {
    this.app.use(cors());
    this.app.use(bodyParser.json());
  }

  public async init() {
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
    this.wsManager = new WebSocketManager(
      this.services.auth,
      this.services.relevance,
      this.services.heartbeat,
      this.services.presence,
      this.connectionRegistry,
      this.eventBus
    );
    this.wsManager.init(this.server);

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
