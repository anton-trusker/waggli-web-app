"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv = __importStar(require("dotenv"));
// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SECRET_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase URL or Key in .env.local');
    process.exit(1);
}
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
async function runSqlFile(filePath) {
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
    }
    catch (err) {
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
        'init_marketing_advanced.sql'
    ];
    console.log("-----------------------------------------");
    console.log("   Waggly SQL Migration Runner   ");
    console.log("-----------------------------------------");
    for (const script of scripts) {
        await runSqlFile(path.join(__dirname, script));
    }
}
main();
