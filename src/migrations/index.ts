import * as migration_20260515_214622_sync_schema from './20260515_214622_sync_schema';
import * as migration_20260516_201527 from './20260516_201527';

export const migrations = [
  {
    up: migration_20260515_214622_sync_schema.up,
    down: migration_20260515_214622_sync_schema.down,
    name: '20260515_214622_sync_schema',
  },
  {
    up: migration_20260516_201527.up,
    down: migration_20260516_201527.down,
    name: '20260516_201527'
  },
];
