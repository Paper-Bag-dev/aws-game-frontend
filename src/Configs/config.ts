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

export enum userType {
  MAIN = "MAIN",
  DUMMY = "DUMMY",
}

export enum EnemyStates {
  IDLE = "idle",
  ROAMING = "roaming",
  CHASING = "chasing",
  ATTACKING = "attacking",
  FOLLOWING = "following",
  DAMAGE = "damage",
}
