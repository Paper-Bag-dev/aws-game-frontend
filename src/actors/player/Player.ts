import * as ex from "excalibur";
import { Config, Direction, userType } from "../../Configs/config";
import BaseGameScene from "../../Scene/Scene";
import socket from "../../SocketManager/socketManager";
import { TAG_ANY_PLAYER } from "../../constants";
import { PlayerActions } from "./PlayerActions";

export class Player extends ex.Actor {
  private canDash = true;
  private Scene: BaseGameScene;
  private pStats;
  private playerActions: PlayerActions;
  private canClick: boolean = true;

  public playerType: number = 0;
  public playerId: string = "";
  public user: string = "";

  private cooldownTimer: ex.Timer | null = null;

  constructor(
    id: string,
    Scene: BaseGameScene,
    pos: ex.Vector,
    userType: string
  ) {
    super({
      name: id,
      pos: pos,
      width: 16,
      height: 20,
      color: ex.Color.Yellow,
      collisionType: ex.CollisionType.Active,
      z: 1,
    });

    this.playerId = id;
    this.Scene = Scene;
    this.pStats = Config.PlayerType[this.playerType];
    this.user = userType;
    this.playerActions = new PlayerActions(this, this.Scene);

    this.cooldownTimer = new ex.Timer({
      fcn: () => {
        console.log("cooldown Complete!");
        this.canDash = true;
      },
      interval: 2000,
      repeats: false,
    });

    this.Scene.add(this.cooldownTimer);
  }

  // ON INIT
  override onInitialize(engine: ex.Engine): void {
    console.log("PlayerClass-playerId", this.playerId);
    this.addTag(TAG_ANY_PLAYER);

    // engine.input.pointers.primary.once("down", (evt) => {
    //   console.log("Click Detected!");
    //   this.playerActions.onShootArrowAction();
    // });

    // const playerSprite = Resources.PlayerImage.toSprite();
    // this.graphics.use(playerSprite);
  }

  // -----------MOVEMENT---------------

  public DIRECTION: Direction = Direction.NULL;

  private isUp(engine: ex.Engine) {
    return (
      engine.input.keyboard.isHeld(ex.Keys.W) ||
      engine.input.keyboard.isHeld(ex.Keys.ArrowUp)
    );
  }

  private isDown(engine: ex.Engine) {
    return (
      engine.input.keyboard.isHeld(ex.Keys.S) ||
      engine.input.keyboard.isHeld(ex.Keys.ArrowDown)
    );
  }

  private isLeft(engine: ex.Engine) {
    return (
      engine.input.keyboard.isHeld(ex.Keys.A) ||
      engine.input.keyboard.isHeld(ex.Keys.ArrowLeft)
    );
  }

  private isRight(engine: ex.Engine) {
    return (
      engine.input.keyboard.isHeld(ex.Keys.D) ||
      engine.input.keyboard.isHeld(ex.Keys.ArrowRight)
    );
  }

  private isShift(engine: ex.Engine) {
    return (
      engine.input.keyboard.isHeld(ex.Keys.ShiftLeft) ||
      engine.input.keyboard.isHeld(ex.Keys.ShiftRight)
    );
  }

  // -------------- ACTIONS ----------------------

  private isSpace(engine: ex.Engine) {
    return engine.input.keyboard.isHeld(ex.Keys.Space);
  }

  private isE(engine: ex.Engine) {
    return engine.input.keyboard.wasReleased(ex.Keys.E);
  }

  // -------------- EMITTERS ---------------------

  // -------------- SETTERS ----------------------

  // ------------- LOGIC -------------------------

  override onPostUpdate(engine: ex.Engine): void {
    let verticalVelocity = 0,
      horizontalVelocity = 0;
    if (this.user === userType.MAIN) {
      // -------------------- BASIC MOVEMENT -----------------
      if (this.isUp(engine)) {
        verticalVelocity -= Config.PlayerBaseSpeed;
      }
      if (this.isDown(engine)) {
        verticalVelocity += Config.PlayerBaseSpeed;
      }

      if (this.isLeft(engine)) {
        horizontalVelocity -= Config.PlayerBaseSpeed;
      }
      if (this.isRight(engine)) {
        horizontalVelocity += Config.PlayerBaseSpeed;
      }

      // DIRECTION SETTER
      if (horizontalVelocity < 0 && verticalVelocity < 0) {
        this.DIRECTION = Direction.UP_LEFT;
      } else if (horizontalVelocity > 0 && verticalVelocity < 0) {
        this.DIRECTION = Direction.UP_RIGHT;
      } else if (horizontalVelocity < 0 && verticalVelocity > 0) {
        this.DIRECTION = Direction.DOWN_LEFT;
      } else if (horizontalVelocity > 0 && verticalVelocity > 0) {
        this.DIRECTION = Direction.DOWN_RIGHT;
      } else if (horizontalVelocity < 0 && verticalVelocity === 0) {
        this.DIRECTION = Direction.LEFT;
      } else if (horizontalVelocity > 0 && verticalVelocity === 0) {
        this.DIRECTION = Direction.RIGHT;
      } else if (horizontalVelocity === 0 && verticalVelocity < 0) {
        this.DIRECTION = Direction.UP;
      } else if (horizontalVelocity === 0 && verticalVelocity > 0) {
        this.DIRECTION = Direction.DOWN;
      } else {
        this.DIRECTION = Direction.NULL; // No movement
      }

      // Diagonal Movement check
      if (horizontalVelocity !== 0 && verticalVelocity !== 0) {
        const totalSpeed = Math.sqrt(
          horizontalVelocity * horizontalVelocity +
            verticalVelocity * verticalVelocity
        );
        this.vel.x = (horizontalVelocity / totalSpeed) * Config.PlayerBaseSpeed;
        this.vel.y = (verticalVelocity / totalSpeed) * Config.PlayerBaseSpeed;
      } else {
        this.vel.x = horizontalVelocity;
        this.vel.y = verticalVelocity;
      }

      if (this.isShift(engine)) {
        const speedMultiplier = 1.5;
        this.vel.x *= speedMultiplier;
        this.vel.y *= speedMultiplier;
      }

      // --------------- ACTIONS ----------------------------
      if (this.isSpace(engine)) {
        switch (this.DIRECTION) {
          case Direction.UP:
            this.dash(0, -Config.PlayerType[this.playerType].dashSpeed);
            break;
          case Direction.DOWN:
            this.dash(0, Config.PlayerType[this.playerType].dashSpeed);
            break;
          case Direction.LEFT:
            this.dash(-Config.PlayerType[this.playerType].dashSpeed, 0);
            break;
          case Direction.RIGHT:
            this.dash(Config.PlayerType[this.playerType].dashSpeed, 0);
            break;
          case Direction.UP_LEFT:
            this.dash(
              -Config.PlayerType[this.playerType].dashSpeed * 0.707,
              -Config.PlayerType[this.playerType].dashSpeed * 0.707
            );
            break;
          case Direction.UP_RIGHT:
            this.dash(
              Config.PlayerType[this.playerType].dashSpeed * 0.707,
              -Config.PlayerType[this.playerType].dashSpeed * 0.707
            );
            break;
          case Direction.DOWN_LEFT:
            this.dash(
              -Config.PlayerType[this.playerType].dashSpeed * 0.707,
              Config.PlayerType[this.playerType].dashSpeed * 0.707
            );
            break;
          case Direction.DOWN_RIGHT:
            this.dash(
              Config.PlayerType[this.playerType].dashSpeed * 0.707,
              Config.PlayerType[this.playerType].dashSpeed * 0.707
            );
            break;
          case Direction.NULL:
            // Do nothing if no direction
            break;
        }
      }

      if(this.isE(engine)){
        this.playerActions.onShootArrowAction();
      }

      socket.emit(`player-changeData`, {
        id: this.playerId,
        type: "player",
        data: {
          x: this.pos.x,
          y: this.pos.y,
          direction: this.DIRECTION,
        },
      });
    }
  }

  // ------------------ COLLISIONS ------------------------
  override onCollisionStart(self: ex.Collider, other: ex.Collider): void {}

  // ------------------ Funcs -----------------------------
  private dash(x: number, y: number) {
    if (!this.canDash) return;

    this.cooldownTimer?.reset();

    this.vel.x = x;
    this.vel.y = y;

    const launchTime = new ex.Timer({
      fcn: () => {
        this.canDash = false;
        this.cooldownTimer?.start();
      },
      interval: 150,
      repeats: false,
    });

    this.Scene.add(launchTime);
    launchTime.start();
  }
}
