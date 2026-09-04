// WebSocket server for real-time event streaming
import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";

// ⚠️  DEMO IMPLEMENTATION: Public real-time event broadcasting
// This is a proof-of-concept for demo/educational purposes.
// All events are broadcast publicly to demonstrate real-time functionality.
// In production, implement proper authentication and private event channels:
//   - Use signed JWT tokens or wallet signature verification
//   - Implement challenge-response authentication with nonces
//   - Validate wallet ownership cryptographically before sending private data
//   - Separate public and private event streams

export interface NetworkEvent {
  type: "query_submitted" | "query_processing" | "proof_generated" | "query_completed" | 
        "terminal_command" | "network_stats" | "node_activity" | "privacy_operation" | "playground_execution" | "blockchain_transaction" | "faucet_claim" | "api_key_generated";
  timestamp: number;
  data: any;
  walletAddress?: string;
}

class RealTimeEventBroadcaster {
  private wss: WebSocketServer | null = null;
  private clients: Map<WebSocket, { walletAddress?: string }> = new Map();

  initialize(httpServer: Server) {
    this.wss = new WebSocketServer({ 
      server: httpServer,
      path: "/ws"
    });

    this.wss.on("connection", (ws: WebSocket, req) => {
      console.log("[WebSocket] Client connected");
      
      // Store client connection
      this.clients.set(ws, {});

      // Handle incoming messages (for authentication)
      ws.on("message", (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          
          if (data.type === "authenticate" && data.walletAddress) {
            const clientInfo = this.clients.get(ws);
            if (clientInfo) {
              clientInfo.walletAddress = data.walletAddress;
              this.clients.set(ws, clientInfo);
              console.log(`[WebSocket] Client authenticated: ${data.walletAddress.slice(0, 8)}...`);
              
              // Send welcome message
              this.sendToClient(ws, {
                type: "network_stats",
                timestamp: Date.now(),
                data: {
                  message: "Connected to ZK Oracle Network real-time feed",
                  activeClients: this.clients.size,
                  status: "authenticated"
                }
              });
            }
          }
        } catch (error) {
          console.error("[WebSocket] Message parse error:", error);
        }
      });

      ws.on("close", () => {
        console.log("[WebSocket] Client disconnected");
        this.clients.delete(ws);
      });

      ws.on("error", (error) => {
        console.error("[WebSocket] Client error:", error);
        this.clients.delete(ws);
      });

      // Send initial connection event
      this.sendToClient(ws, {
        type: "network_stats",
        timestamp: Date.now(),
        data: {
          message: "Connected to real-time feed",
          activeClients: this.clients.size,
          status: "connected"
        }
      });
    });

    // Start simulated network activity
    this.startNetworkSimulation();

    console.log("[WebSocket] Server initialized on /ws");
  }

  private sendToClient(ws: WebSocket, event: NetworkEvent) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(event));
    }
  }

  // Broadcast to all connected clients (public demo implementation)
  broadcast(event: NetworkEvent) {
    this.clients.forEach((clientInfo, ws) => {
      this.sendToClient(ws, event);
    });
  }

  // Broadcast to specific wallet (demo: actually broadcasts to all)
  // In production, this would verify wallet ownership before sending private data
  broadcastToWallet(walletAddress: string, event: NetworkEvent) {
    // For demo purposes, broadcast to all clients
    // Production would verify wallet signatures and only send to authenticated owner
    this.broadcast(event);
  }

  // Simulate network activity for demo purposes
  private startNetworkSimulation() {
    const events = [
      "Query submitted from node #42",
      "Proof verification in progress...",
      "Consensus reached: 5/5 nodes",
      "ZK proof validated successfully",
      "Privacy shield activated",
      "Network latency: 23ms",
      "New oracle node joined network",
      "Encryption key rotated"
    ];

    const nodeActivities = [
      { nodeId: "oracle-1", status: "active", load: Math.random() * 100 },
      { nodeId: "oracle-2", status: "active", load: Math.random() * 100 },
      { nodeId: "oracle-3", status: "active", load: Math.random() * 100 },
      { nodeId: "oracle-4", status: "active", load: Math.random() * 100 },
      { nodeId: "oracle-5", status: "active", load: Math.random() * 100 },
    ];

    // Broadcast random network events
    setInterval(() => {
      if (this.clients.size > 0) {
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        this.broadcast({
          type: "node_activity",
          timestamp: Date.now(),
          data: {
            message: randomEvent,
            activity: nodeActivities[Math.floor(Math.random() * nodeActivities.length)]
          }
        });
      }
    }, 3000);

    // Broadcast network stats
    setInterval(() => {
      if (this.clients.size > 0) {
        this.broadcast({
          type: "network_stats",
          timestamp: Date.now(),
          data: {
            activeQueries: Math.floor(Math.random() * 50) + 10,
            totalProofs: Math.floor(Math.random() * 1000) + 5000,
            networkLoad: Math.floor(Math.random() * 60) + 20,
            avgLatency: Math.floor(Math.random() * 30) + 15,
            activeNodes: 5,
            connectedClients: this.clients.size
          }
        });
      }
    }, 5000);
  }

  // Public method to emit events from other parts of the app
  emitEvent(event: NetworkEvent) {
    this.broadcast(event);
  }

  // Public method to emit wallet-specific events
  emitWalletEvent(walletAddress: string, event: NetworkEvent) {
    this.broadcastToWallet(walletAddress, {
      ...event,
      walletAddress
    });
  }
}

// Singleton instance
export const realTimeEvents = new RealTimeEventBroadcaster();

