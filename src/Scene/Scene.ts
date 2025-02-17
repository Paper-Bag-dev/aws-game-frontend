import * as ex from "excalibur";
import { Player } from "../actors/player/Player";
import * as tiled from "@excaliburjs/plugin-tiled";
import { Socket } from "socket.io-client";
import { Direction, userType } from "../Configs/config";
import Goblin from "../actors/enemy/goblin/Goblin";
import { Arrow } from "../actors/projectile/arrow";
import { Projectiles } from "../Config";


class BaseGameScene extends ex.Scene {
  random = new ex.Random();
  p1: Player;
  p2: Player;
  p3?: Player;
  goblin: Goblin;
  userId: string;
  tileMap: tiled.TiledResource;
  socket: Socket;
  updatedUsersData: {
    id: string;
    data: {
      x: number;
      y: number;
      direction: string;
    };
  } | null = null;

  // take players, tilemap, json object(for rest of actors and buildings)
  constructor(
    players: string[],
    userId: string,
    socket: Socket,
    tileMapResource: tiled.TiledResource,
  ) {
    super();
    // Init Players

    // Init Socket
    this.socket = socket;

    // Init Scene
    this.tileMap = tileMapResource;

    this.userId = userId;

    this.goblin = new Goblin("gobta", this, socket);
    this.goblin.owner = userId;

    if(players[0] === userId){
      this.p1 = new Player(players[0], this, new ex.Vector(20,20), userType.MAIN);
      this.p2 = new Player(players[1], this, new ex.Vector(40,40), userType.DUMMY);
    }else{
      this.p1 = new Player(players[0], this, new ex.Vector(20,20), userType.DUMMY);
      this.p2 = new Player(players[1], this, new ex.Vector(40,40), userType.MAIN);
    }

    // SOCKET
    // DEFAULT CHANGE DATA OF ALL USERS


    this.socket.on("server-update-player", (data) => {
      this.updatedUsersData = data;
      // console.log("test", this.updatedUsersData);
      
      if (this.updatedUsersData) {
        const targetPlayer = this.p2.user !== userType.MAIN && this.p2.playerId === this.updatedUsersData.id
          ? this.p2
          : this.p1.user !== userType.MAIN && this.p1.playerId === this.updatedUsersData.id
            ? this.p1
            : null;
  
        if (targetPlayer) {
          const interpolationFactor: number = 0.1; 
          // Smooth interpolation
          const targetX = this.updatedUsersData.data.x;
          const targetY = this.updatedUsersData.data.y;
          
          targetPlayer.pos.x = ex.lerp(targetPlayer.pos.x, targetX, interpolationFactor);
          targetPlayer.pos.y = ex.lerp(targetPlayer.pos.y, targetY, interpolationFactor);
          targetPlayer.DIRECTION = this.updatedUsersData.data.direction as Direction;
        }
      }
    });

    // ENEMY
    this.socket.on("server-update-enemy", (data) => {
      console.log(data);
      if(data.id === "goblin"){
        this.goblin.clientType = data.clientType
        this.goblin.pos.x = data.x;
        this.goblin.pos.y = data.y;
        this.goblin.direction = data.direction as Direction;
        this.goblin.hp = data.hp;
        this.goblin.state = data.state;
        this.goblin.updates = true;
      }
    });

    // Projectile
    this.socket.on("server-create-projectile", (data: Projectiles) => {
      // console.log("Projectile Creation!", data);
      if(data.type === "projectile"){
        const arrow = new Arrow(data.x, data.y, data.direction);

        if(this.p1.name === data.owner){
          arrow.owner = this.p1;
        }else{
          arrow.owner = this.p2;
        }

        this.add(arrow);
      }
    });
  }

  override onInitialize(engine: ex.Engine): void {
    // BUILD MAP

    const Collidables = this.tileMap.getObjectLayers("Collidables");

    Collidables[0].objects.forEach((shape) => {
      const colliderActor = new ex.Actor({
        pos: ex.vec(shape.x, shape.y),
        anchor: ex.vec(0, 0),
        width: shape.tiledObject.width,
        height: shape.tiledObject.height,
        collisionType: ex.CollisionType.Fixed,
      });

      this.add(colliderActor);
    });

    this.tileMap.addToScene(this);

    // PLAYER LOGIC
    // here need to add a check in future to see which client is which player and lock them accordingly
    this.add(this.p1);
    this.add(this.p2);

    // TEST ENEMY ADDED
    this.add(this.goblin);

    if (this.p1.playerId === this.userId) {
      this.camera.strategy.lockToActor(this.p1);
    } else {
      this.camera.strategy.lockToActor(this.p2);
    }
    this.camera.zoom = 2;
  }

  override onPreUpdate(engine: ex.Engine, elapsed: number): void {
    // if (this.updatedUsersData) {
    //   const targetPlayer = this.p2.user !== userType.MAIN && this.p2.playerId === this.updatedUsersData.id
    //     ? this.p2
    //     : this.p1.user !== userType.MAIN && this.p1.playerId === this.updatedUsersData.id
    //       ? this.p1
    //       : null;

    //   if (targetPlayer) {
    //     const interpolationFactor: number = 0.1; 
    //     // Smooth interpolation
    //     const targetX = this.updatedUsersData.x;
    //     const targetY = this.updatedUsersData.y;
        
    //     targetPlayer.pos.x = ex.lerp(targetPlayer.pos.x, targetX, interpolationFactor);
    //     targetPlayer.pos.y = ex.lerp(targetPlayer.pos.y, targetY, interpolationFactor);
    //     targetPlayer.DIRECTION = this.updatedUsersData.direction as Direction;
    //   }
    // }
  }

  override onPostUpdate(engine: ex.Engine, elapsed: number): void {}
}

export default BaseGameScene;
