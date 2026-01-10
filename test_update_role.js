// Test script để kiểm tra update role
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  console.log('URL:', !!supabaseUrl);
  console.log('Service Key:', !!supabaseServiceKey);
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function testUpdateRole() {
  console.log('=== Test Update Role to senior_collaborator ===\n');

  // 1. List all users
  console.log('1. Listing users...');
  const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (listError) {
    console.error('List users error:', listError);
    return;
  }

  console.log(`Found ${users.length} users\n`);

  // Find a collaborator to test
  const collaborator = users.find(u => 
    u.user_metadata?.role === 'collaborator' || 
    u.user_metadata?.role === 'ctv'
  );

  if (!collaborator) {
    console.log('No collaborator found to test');
    console.log('\nAll users:');
    users.forEach(u => {
      console.log(`- ${u.email}: ${u.user_metadata?.role || 'no role'}`);
    });
    return;
  }

  console.log(`2. Found collaborator: ${collaborator.email}`);
  console.log(`   Current role: ${collaborator.user_metadata?.role}`);
  console.log(`   ID: ${collaborator.id}\n`);

  // 3. Try to update role
  console.log('3. Updating role to senior_collaborator...');
  
  const updatePayload = {
    user_metadata: {
      ...collaborator.user_metadata,
      role: 'senior_collaborator'
    }
  };

  console.log('Update payload:', JSON.stringify(updatePayload, null, 2));

  const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    collaborator.id,
    updatePayload
  );

  if (updateError) {
    console.error('\n❌ Update error:', updateError);
    return;
  }

  console.log('\n✅ Update successful!');
  console.log('New role:', updatedUser.user.user_metadata?.role);

  // 4. Revert back to collaborator
  console.log('\n4. Reverting back to collaborator...');
  
  const { error: revertError } = await supabaseAdmin.auth.admin.updateUserById(
    collaborator.id,
    {
      user_metadata: {
        ...updatedUser.user.user_metadata,
        role: 'collaborator'
      }
    }
  );

  if (revertError) {
    console.error('Revert error:', revertError);
  } else {
    console.log('✅ Reverted successfully');
  }
}

testUpdateRole().catch(console.error);
