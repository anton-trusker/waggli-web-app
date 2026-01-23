
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SECRET_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase URL or Key in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSqlFile(filePath: string) {
    console.log(`\n🚀 Running migration: ${path.basename(filePath)}`);

    try {
        const sql = fs.readFileSync(filePath, 'utf8');

        // Split by semicolon via a naive approach (since execute_sql might handle blocks differently)
        // Adjust depending on how you can execute raw SQL. 
        // NOTE: The supabase-js client does NOT strictly have a generic 'query' or 'execute' method for raw SQL 
        // unless you use the 'rpc' to call a Postgres function that runs SQL, OR if you use the Postgres connection string.
        // HOWEVER, for many setups, we might rely on the user running this, but if we want to run it via code:
        // We will assume a 'exec_sql' RPC function exists, OR we will fail and tell the user they need it.
        // Alternatively, if you have the Postgres connection string, we could use 'pg' library.

        // Since we don't know if 'rpc' exists, this might fail if we don't have a helper.
        // Let's TRY to use a standard RPC function 'exec_sql' or similar if it exists.
        // IF NOT, we will log the SQL and ask user to run it.

        // Actually, without an 'exec_sql' function in the DB, supabase-js cannot run raw DDL.
        // But we can try to use the 'pg' library if we can find the connection string.
        // The user environment often only has URL/Key.

        // Fallback: We will just print the instructions clearly for now, as we cannot strictly run DDL via the JS client 
        // without a pre-existing RPC function.

        const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

        if (error) {
            // Check if function not found
            if (error.message.includes('function "exec_sql" does not exist')) {
                console.error(`⚠️  Cannot execute SQL directly via JS client because 'exec_sql' RPC is missing.`);
                console.log(`👉 Please copy/paste the content of ${path.basename(filePath)} into the Supabase SQL Editor.`);
                return false;
            }
            throw error;
        }

        console.log(`✅ Success: ${path.basename(filePath)}`);
        return true;

    } catch (err: any) {
        console.error(`❌ Failed: ${err.message}`);
        return false;
    }
}

async function main() {
    const scripts = [
        'fix_missing_columns.sql',
        'fix_user_profile_fields.sql',
        'verify_localization_schema.sql',
        'seed_localization.sql',
        'init_admin_rbac.sql',
        'init_moderation.sql',
        'init_subscriptions.sql',
        'init_marketing_advanced.sql',
        'update_subscriptions_spec.sql'
    ];

    console.log("-----------------------------------------");
    console.log("   Waggly SQL Migration Runner   ");
    console.log("-----------------------------------------");

    for (const script of scripts) {
        await runSqlFile(path.join(__dirname, script));
    }
}

main();
