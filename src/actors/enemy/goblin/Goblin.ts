import * as ex from "excalibur";
import BaseGameScene from "../../../Scene/Scene";
import { TAG_ANY_ENEMY, TAG_ANY_PLAYER } from "../../../constants.ts";
import { randomFromArray } from "../../../helpers.ts";
import { Direction } from "../../../Config.ts";
import { EnemyStates } from "../../../Config.ts";
import { Socket } from "socket.io-client";

type SelectedEnemyStates =
  | EnemyStates.ROAMING
  | EnemyStates.CHASING
  | EnemyStates.DAMAGE
  | EnemyStates.ATTACKING;

export default class Goblin extends ex.Actor {
  private Scene: BaseGameScene;
  private socketManager: Socket;
  private moveSpeed: number = 80; // Adjust speed as needed
  public direction: Direction = Direction.NULL;
  public owner: string | null = null;
  public clientType: "active" | "dummy" = "active";
  public updates: boolean = false;

  hp: number = 5;
  state: SelectedEnemyStates = EnemyStates.ROAMING;
  target: any = null;

  private targetQueryTimer: ex.Timer | null = null;

  constructor(Id: string, Scene: BaseGameScene, sckMngr: Socket) {
    super({
      name: Id,
      anchor: ex.vec(0, 0),
      pos: ex.vec(200, 200),
      width: 16,
      height: 16,
      color: ex.Color.Green,
      collisionType: ex.CollisionType.Active,
      z: 1,
    });

    this.Scene = Scene;
    this.socketManager = sckMngr;
  }

  override onInitialize(engine: ex.Engine): void {
    this.addTag(TAG_ANY_ENEMY);

    // Timer to check updates and switch clientType accordingly
    this.targetQueryTimer = new ex.Timer({
      fcn: () => {
        console.log("Checking for updates")
        if (this.updates) {
          // If updates are still true, reset the flag and timer logic
          this.updates = false;
          return;
        }

        // If no updates received, set to active
        this.clientType = "active";
        this.queryForTarget();
      },
      interval: 500, // Check every 0.5 seconds
      repeats: true,
    });

    this.Scene.add(this.targetQueryTimer);
    this.targetQueryTimer.start();
  }

  override onPreUpdate(engine: ex.Engine, elapsed: number): void {}

  queryForTarget() {
    if (
      !this.target ||
      !this.target?.isKilled() ||
      this.clientType === "active"
    ) {
      // console.log("Querying for target");
      this.state = EnemyStates.ROAMING;

      const players = this.Scene.world
        .queryTags([TAG_ANY_PLAYER])
        .getEntities() as ex.Actor[];

      if (players.length > 0) {
        // Find players within a specific range
        const nearbyPlayers = players.filter((actor) => {
          const actorDistance = this.pos.distance(actor.pos);
          return actorDistance <= 80;
        });

        if (nearbyPlayers.length > 0) {
          this.target = randomFromArray(nearbyPlayers);
          this.state = EnemyStates.CHASING; // Set to CHASING only if a nearby player is found
        } else {
          this.target = randomFromArray(players); // Optional: Assign any player if needed
        }
      }
    }
  }

  override onPostUpdate(engine: ex.Engine, elapsed: number): void {
    if (
      this.clientType === "active" &&
      this.target &&
      this.state === EnemyStates.CHASING
    ) {
      this.moveTowardsTarget(elapsed);
      if (this.pos.distance(this.target.pos) >= 80) {
        this.state = EnemyStates.ROAMING;
        this.target = null;
        this.vel.x = 0;
        this.vel.y = 0;
      }
    }

    if (this.clientType === "active") {
      const data = {
        id: this.name,
        owner: this.owner,
        type: "enemy",
        x: this.pos.x,
        y: this.pos.y,
        hp: this.hp,
        state: this.state,
        direction: this.direction,
      };

      this.socketManager.emit("client-update-enemy", data);
    }
  }

  private moveTowardsTarget(elapsed: number) {
    if (this.target) {
      const direction = new ex.Vector(
        this.target.pos.x - this.pos.x,
        this.target.pos.y - this.pos.y
      ).normalize();

      this.vel = direction.scale(this.moveSpeed);
      this.direction = direction.x > 0 ? Direction.RIGHT : Direction.LEFT;
    }
  }
}
