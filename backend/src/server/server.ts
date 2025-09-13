import express from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import { errorHandler } from "../middleware/error-handler";
import { DB } from "../db/db";
import { EventBusPort, PresencePort, Repos, Services } from "../types/types";
import { createRepos } from "../db/factories/repo.factory";
import { WebSocketManager } from "../websocket/websocket-manager";
import { registerRoutes } from "../routes/factories/route.factory";
import { createServices } from "../services/factories/service.factory";
import { EventBus } from "../websocket/event-bus";
import { PresenceAdapter } from "../websocket/adapters/websocket-presence.adapter";

export class Server {
  private app = express();
  private server = http.createServer(this.app);
  private wsManager!: WebSocketManager;
  private db!: DB;

  private eventBus!: EventBus;
  private presenceManager!: PresencePort;
  private repos!: Repos;
  private services!: Services;

  constructor() {
    this.app.use(cors());
    this.app.use(bodyParser.json());
  }

  public async init() {
    this.db = new DB();
    await this.db.initTables();

    // Initialise repos
    this.repos = createRepos(this.db);

    // Initialise event bus + presence manager
    this.eventBus = new EventBus();

    // Initialise WebSocket manager
    this.wsManager = new WebSocketManager(this.server, this.eventBus);

    this.presenceManager = new PresenceAdapter(this.eventBus);

    // Initialise services
    this.services = createServices(
      this.repos,
      this.eventBus,
      this.presenceManager
    );

    // Register routes
    registerRoutes(this.app, this.services);

    // Error handler
    this.app.use(errorHandler);
  }

  start(port: number) {
    this.server.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  }
}
