#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/3de8a1c1ee73d61ab17387428cd84b5fc7c8ad7f765bee5a057bd1ed664c3b38/contract';
import startContract from '../../snapshots/3de8a1c1ee73d61ab17387428cd84b5fc7c8ad7f765bee5a057bd1ed664c3b38/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/a5b7bcde41058a48765457e77ac6adde2afc67b1f887497ee858d70ee2a1c5f9/contract';
import endContract from '../../snapshots/a5b7bcde41058a48765457e77ac6adde2afc67b1f887497ee858d70ee2a1c5f9/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'Channel',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('workspaceId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Channel',
        constraint: 'Channel_workspaceId_name_key',
        columns: ['workspaceId', 'name'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Channel',
        index: 'Channel_workspaceId_idx_ba65f874',
        columns: ['workspaceId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Channel',
        foreignKey: {
          name: 'Channel_workspaceId_fkey',
          columns: ['workspaceId'],
          references: { schema: 'public', table: 'Workspace', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
