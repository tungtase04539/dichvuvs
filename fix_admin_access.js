const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const ADMIN_EMAIL = 'admin@admin.com';

async function fixAdmin() {
    console.log(`--- Fixing Admin access for ${ADMIN_EMAIL} ---`);

    // 1. Update Prisma User table
    try {
        const dbUser = await prisma.user.updateMany({
            where: { email: ADMIN_EMAIL },
            data: { role: 'admin' }
        });
        console.log(`Prisma update result: ${JSON.stringify(dbUser)}`);
    } catch (e) {
        console.error('Prisma update failed:', e.message);
    }

    // 2. Update Supabase Auth Metadata
    try {
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) throw listError;

        const user = users.find(u => u.email === ADMIN_EMAIL);
        if (user) {
            console.log(`Found Supabase user: ${user.id}`);
            const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
                user.id,
                { user_metadata: { ...user.user_metadata, role: 'admin' } }
            );
            if (updateError) throw updateError;
            console.log('Supabase Auth metadata updated to admin');
        } else {
            console.log('User not found in Supabase Auth');
        }
    } catch (e) {
        console.error('Supabase update failed:', e.message);
    }

    await prisma.$disconnect();
    console.log('--- Done ---');
}

fixAdmin();
