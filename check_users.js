const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function checkAdmins() {
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('--- User List ---');
    users.forEach(u => {
        console.log(`Email: ${u.email} | Role: ${u.user_metadata?.role} | ID: ${u.id}`);
    });
}

checkAdmins();
