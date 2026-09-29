#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/1298d94a30c7dcd6d5355cf494a0d47e1dda94248a3d9efd7f5c8e04d7966c27/contract';
import endContract from '../../snapshots/1298d94a30c7dcd6d5355cf494a0d47e1dda94248a3d9efd7f5c8e04d7966c27/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/91e7f9f035806fa2789a4d726ef7724cad434fd6b00014d47ebf12d6e6bb784e/contract';
import startContract from '../../snapshots/91e7f9f035806fa2789a4d726ef7724cad434fd6b00014d47ebf12d6e6bb784e/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropTable({ schema: 'public', table: 'Post' }),
      this.dropColumn({ schema: 'public', table: 'User', column: 'name' }),
      this.dropColumn({ schema: 'public', table: 'User', column: 'username' }),
      this.addColumn({
        schema: 'public',
        table: 'User',
        column: col('password', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.setNotNull({ schema: 'public', table: 'User', column: 'password' }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
