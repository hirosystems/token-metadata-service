import { Sql } from 'postgres';

export const up = async (sql: Sql<any>) => {
  await sql`CREATE TABLE metadata_properties (
      id                  SERIAL PRIMARY KEY,
      metadata_id         INT NOT NULL,
      type                TEXT,
      description         TEXT,
      value               TEXT,

      CONSTRAINT metadata_properties_metadata_id_fk FOREIGN KEY(metadata_id) REFERENCES metadata(id)
    )`;
};

export const down = async (sql: Sql<any>) => {
  await sql`DROP TABLE metadata_properties`;
};
