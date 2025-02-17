import { Vector } from "excalibur";

export const Config = {
  PlayerBaseSpeed: 100,
  PlayerType: [
    {
      hp: 100,
      mp: 30,
      ep: 70,
      baseSpeed: 80,
      dashSpeed: 350,
      items: {},
    },
  ],
} as const;

export enum Direction {
  NULL = "NULL",
  UP = "UP",
  DOWN = "DOWN",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
  UP_LEFT = "UP_LEFT",
  UP_RIGHT = "UP_RIGHT",
  DOWN_LEFT = "DOWN_LEFT",
  DOWN_RIGHT = "DOWN_RIGHT",
}

export enum EnemyStates {
  IDLE = "idle",
  ROAMING = "roaming",
  CHASING = "chasing",
  ATTACKING = "attacking",
  FOLLOWING = "following",
  DAMAGE = "damage",
}


export const DirectionVectors = {
  [Direction.UP]: new Vector(0, -1),
  [Direction.DOWN]: new Vector(0, 1),
  [Direction.LEFT]: new Vector(-1, 0),
  [Direction.RIGHT]: new Vector(1, 0),
  [Direction.UP_LEFT]: new Vector(-1, -1),
  [Direction.UP_RIGHT]: new Vector(1, -1),
  [Direction.DOWN_LEFT]: new Vector(-1, 1),
  [Direction.DOWN_RIGHT]: new Vector(1, 1),
  [Direction.NULL]: new Vector(0, 0),
};

export interface Projectiles{
  type: string;
  name: string;
  owner: string;
  direction: Direction;
  x: number;
  y: number;
}