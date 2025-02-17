import * as ex from "excalibur";
import { Arrow } from "../projectile/arrow";
import { Player } from "./Player";
import { socketManager } from "../../SocketManager/socketManager";
import BaseGameScene from "../../Scene/Scene";
import { Direction } from "../../Configs/config";

export class PlayerActions {
  actor: Player;
  engine: ex.Engine;
  scene: ex.Scene;
  constructor(actor: Player, scene: BaseGameScene) {
    this.actor = actor;
    this.engine = actor.scene?.engine as ex.Engine;
    this.scene = scene;
  }

  onShootArrowAction() {
    const { actor, engine } = this;

    if (actor.DIRECTION === undefined) {
      throw new Error("Actor direction is undefined");
    }

    if (actor.DIRECTION !== Direction.NULL) {
      
      const arrow = new Arrow(actor.pos.x, actor.pos.y, actor.DIRECTION);
      arrow.owner = actor;
      this.scene.add(arrow);
      socketManager.emitProjectileData({
        type: "projectile",
        name: arrow.name,
        owner: actor.name,
        direction: arrow.direction,
        x: arrow.pos.x,
        y: arrow.pos.y,
      });
    }
  }
}
