import * as ex from "excalibur";
import { Direction } from "../../Config";
import { TAG_PLAYER_WEAPON } from "../../constants";
import { DirectionVectors } from "../../Config";
import { Player } from "../player/Player";

export class Arrow extends ex.Actor {
  private expires: number = 2000;
  private speed: number = 300;
  public owner: Player | null = null;
  public direction: Direction;
  constructor(x: number, y: number, direction: Direction) {
    super({
      name: "arrow-base",
      pos: new ex.Vector(x, y),
      anchor: new ex.Vector(0, 0),
      width: 4,
      height: 10,
      color: ex.Color.Red,
      collisionType: ex.CollisionType.Passive,
      collisionGroup: ex.CollisionGroupManager.groupByName("playerProjectile"),
    });

    this.addTag(TAG_PLAYER_WEAPON);

    this.direction = direction;

    const directionVector = DirectionVectors[direction].normalize();
    const angle = Math.atan2(directionVector.y, directionVector.x);
    this.rotation = angle + Math.PI / 2;
    this.vel = directionVector.scale(this.speed);
  }

  // remove after hitting
  onDamagedSomething() {
    this.kill();
  }

  override onPreUpdate(engine: ex.Engine, elapsed: number): void {
    this.expires -= elapsed;
    if (this.expires <= 0) {
      this.kill();
    }
  }
}
