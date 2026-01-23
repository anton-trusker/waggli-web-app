-- Create a helper function to execute SQL from the client
-- This allows us to run migrations via the JS SDK (protected by admin role ideally)

create or replace function exec_sql(sql_query text)
returns void
language plpgsql
security definer
as $$
begin
  execute sql_query;
end;
$$;
