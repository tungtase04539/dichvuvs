const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

async function fixUserRoles() {
    console.log('--- Starting Role Fix Cleanup ---');

    // 1. Get all users (using the same RPC if possible, or listUsers)
    // Since listUsers has pagination, we use a simple loop or RPC
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
        console.error('Error fetching users:', error);
        return;
    }

    console.log(`Found ${users.length} users to check.`);

    let fixCount = 0;
    for (const user of users) {
        const currentRole = user.user_metadata?.role;

        if (!currentRole) {
            console.log(`Fixing user ${user.email}: Setting role to 'customer'`);

            const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
                user.id,
                { user_metadata: { ...user.user_metadata, role: 'customer' } }
            );

            if (updateError) {
                console.error(`Error updating user ${user.email}:`, updateError.message);
            } else {
                fixCount++;
            }
        } else {
            console.log(`Skipping user ${user.email}: Already has role '${currentRole}'`);
        }
    }

    console.log('--- Cleanup Finished ---');
    console.log(`Successfully fixed ${fixCount} users.`);
}

fixUserRoles();
