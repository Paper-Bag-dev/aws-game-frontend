import { io } from "socket.io-client";
import { Socket } from "socket.io-client";

const URL = "http://localhost:8080";

class SocketManager {
  public socket: Socket;
  constructor() {
    this.socket = io(URL);
  }

  emitProjectileData(data: any) {
    this.socket.emit("client-create-projectile", data);
  }
}

export const socketManager = new SocketManager();

socketManager.socket.on("connection", () => {
  console.log("Socket Connected");
});

socketManager.socket.on("connection", () => {
  console.log("Socket Connected");
});

socketManager.socket.on("disconnect", () => {
  console.log("Socket Disconnected");
});

export default socketManager.socket;
