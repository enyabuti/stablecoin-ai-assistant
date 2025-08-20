# Database Security - Row Level Security (RLS) Implementation

This directory contains SQL migrations to fix the **critical security vulnerabilities** identified by Supabase's security advisor.

## Security Issues Addressed

The following tables had **RLS disabled**, exposing sensitive data to unauthorized access:
- `users` - User account information
- `accounts` - OAuth account data
- `sessions` - Authentication sessions
- `verificationtokens` - Email verification tokens
- `wallets` - User wallet addresses and blockchain data
- `contacts` - User contact information
- `rules` - Automation rules
- `executions` - Rule execution history
- `quotes` - Fee quotes and estimates
- `webhook_events` - External webhook data
- `audit_logs` - Security and activity logs
- `security_alerts` - Security incident alerts

## Migration Files

### `001_enable_rls.sql`
- Enables Row Level Security on all public tables
- Creates comprehensive RLS policies for data isolation
- Ensures users can only access their own data
- Provides service role access for admin operations

## How to Apply the Migration

### Option 1: Using Supabase Dashboard (Recommended)
1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy and paste the content of `001_enable_rls.sql`
4. Click **Run** to execute the migration

### Option 2: Using Supabase CLI
```bash
supabase db reset
# or for existing database:
psql -h your-db-host -U postgres -d postgres -f sql/migrations/001_enable_rls.sql
```

### Option 3: Using psql directly
```bash
psql "postgresql://postgres:[password]@[host]:5432/postgres" -f sql/migrations/001_enable_rls.sql
```

## RLS Policy Overview

### User Data Isolation
- **Users**: Can only view/modify their own profile
- **Wallets**: Users access only their wallets
- **Contacts**: Users access only their contacts
- **Rules**: Users access only their automation rules
- **Executions**: Users access only executions of their rules
- **Quotes**: Users access only quotes for their rules

### System Operations
- **Webhook Events**: Allow creation for incoming webhooks, users can view their own
- **Audit Logs**: System can create logs, users can view their own
- **Security Alerts**: System can create alerts, users can view/resolve their own
- **Verification Tokens**: Open access needed for auth flow

### Administrative Access
- **Service Role**: Full access to all tables for admin operations
- All policies include service role bypass for system management

## Testing the Implementation

After applying the migration, verify RLS is working:

```sql
-- Check that RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;

-- List all RLS policies
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

## Security Benefits

✅ **Data Isolation**: Users cannot access other users' data  
✅ **Breach Containment**: Compromised accounts can't access other user data  
✅ **Compliance**: Meets data protection requirements  
✅ **Audit Trail**: All access is logged and controlled  
✅ **Service Operations**: Admin functions still work via service role  

## Important Notes

- **Backup First**: Always backup your database before applying migrations
- **Test Environment**: Apply to staging/test environment first
- **Monitor**: Watch for any application errors after deployment
- **Service Role**: Ensure your service role credentials are secure

## Rollback (if needed)

To disable RLS (NOT recommended):
```sql
-- WARNING: This removes security protections
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
-- Repeat for each table...
```

## Next Steps

1. Apply the migration to your Supabase database
2. Test your application functionality
3. Monitor for any access issues
4. Update this README if additional policies are needed

The RLS policies are designed to maintain application functionality while providing robust security. All legitimate user operations should continue to work normally.