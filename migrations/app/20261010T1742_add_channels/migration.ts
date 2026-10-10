#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/1298d94a30c7dcd6d5355cf494a0d47e1dda94248a3d9efd7f5c8e04d7966c27/contract';
import startContract from '../../snapshots/1298d94a30c7dcd6d5355cf494a0d47e1dda94248a3d9efd7f5c8e04d7966c27/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/a5b7bcde41058a48765457e77ac6adde2afc67b1f887497ee858d70ee2a1c5f9/contract';
import endContract from '../../snapshots/a5b7bcde41058a48765457e77ac6adde2afc67b1f887497ee858d70ee2a1c5f9/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
} from '@prisma/orm-postgres/migration';

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
      this.createTable({
        schema: 'public',
        table: 'Membership',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('role', 'text', {
            notNull: true,
            default: lit('MEMBER'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('userId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('workspaceId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Membership_role_check_50a44636',
            "\"role\" IN ('OWNER', 'ADMIN', 'MEMBER')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'Workspace',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('slug', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Channel',
        constraint: 'Channel_workspaceId_name_key',
        columns: ['workspaceId', 'name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Membership',
        constraint: 'Membership_userId_workspaceId_key',
        columns: ['userId', 'workspaceId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Workspace',
        constraint: 'Workspace_slug_key',
        columns: ['slug'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Channel',
        index: 'Channel_workspaceId_idx_ba65f874',
        columns: ['workspaceId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Membership',
        index: 'Membership_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Membership',
        index: 'Membership_workspaceId_idx_ba65f874',
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
      this.addForeignKey({
        schema: 'public',
        table: 'Membership',
        foreignKey: {
          name: 'Membership_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Membership',
        foreignKey: {
          name: 'Membership_workspaceId_fkey',
          columns: ['workspaceId'],
          references: { schema: 'public', table: 'Workspace', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
