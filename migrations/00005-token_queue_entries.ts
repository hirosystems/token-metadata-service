import { Sql } from 'postgres';

export const up = async (sql: Sql<any>) => {
  await sql`
    CREATE TYPE token_queue_entry_status AS ENUM ('new', 'processing', 'retry', 'ready')
  `;
  await sql`CREATE TABLE token_queue_entries (
      id                  SERIAL PRIMARY KEY,
      token_id            INT NOT NULL,
      status              token_queue_entry_status DEFAULT 'new',
      retry_count         INT DEFAULT 0,
      created_at          TIMESTAMP NOT NULL,
      updated_at          TIMESTAMP,

      CONSTRAINT token_queue_entries_token_id_fk FOREIGN KEY(token_id) REFERENCES tokens(id)
    )`;
};

export const down = async (sql: Sql<any>) => {
  await sql`DROP TABLE token_queue_entries`;
  await sql`DROP TYPE token_queue_entry_status`;
};
