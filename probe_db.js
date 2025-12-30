const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function probe() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        console.log("Missing config");
        return;
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    console.log("Probing columns for 'Service'...");
    const { data: cols, error } = await supabase.rpc('get_table_info', { t_name: 'Service' });

    // If RPC doesn't exist, try direct query via SQL (if possible via RPC)
    // Actually, let's just try to insert a dummy record and see the error
    const { error: insError } = await supabase.from('Service').select('chatbotLink').limit(1);

    if (insError) {
        console.log("Error selecting chatbotLink from Service:", insError.message);
    } else {
        console.log("Successfully selected chatbotLink from Service. It exists!");
    }

    // List ALL tables in public schema
    const { data: tables, error: tableError } = await supabase.from('pg_catalog.pg_tables').select('tablename').eq('schemaname', 'public');
    if (tableError) {
        // Most likely can't query pg_tables directly. Try a common table.
        console.log("Could not query pg_tables.");
    } else {
        console.log("Tables in public schema:", tables.map(t => t.tablename).join(', '));
    }
}

probe();
