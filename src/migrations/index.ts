import * as migration_20260518_122150 from './20260518_122150';

export const migrations = [
  {
    up: migration_20260518_122150.up,
    down: migration_20260518_122150.down,
    name: '20260518_122150'
  },
];
