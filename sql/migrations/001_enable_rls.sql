-- Enable Row Level Security (RLS) for all public tables
-- This migration addresses the Supabase security advisor warnings

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verificationtokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
-- Users can only see and modify their own record
CREATE POLICY "Users can view their own record" ON public.users
    FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update their own record" ON public.users
    FOR UPDATE USING (auth.uid()::text = id);

-- Service role can manage all users for admin operations
CREATE POLICY "Service role can manage all users" ON public.users
    FOR ALL USING (auth.role() = 'service_role');

-- Create RLS policies for accounts table
-- Users can only access their own OAuth accounts
CREATE POLICY "Users can view their own accounts" ON public.accounts
    FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can manage their own accounts" ON public.accounts
    FOR ALL USING (auth.uid()::text = "userId");

-- Service role can manage all accounts
CREATE POLICY "Service role can manage all accounts" ON public.accounts
    FOR ALL USING (auth.role() = 'service_role');

-- Create RLS policies for sessions table
-- Users can only access their own sessions
CREATE POLICY "Users can view their own sessions" ON public.sessions
    FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can manage their own sessions" ON public.sessions
    FOR ALL USING (auth.uid()::text = "userId");

-- Service role can manage all sessions
CREATE POLICY "Service role can manage all sessions" ON public.sessions
    FOR ALL USING (auth.role() = 'service_role');

-- Create RLS policies for verificationtokens table
-- Verification tokens don't have user association, allow authenticated users to access
-- This is needed for the auth flow to work properly
CREATE POLICY "Allow access to verification tokens" ON public.verificationtokens
    FOR ALL USING (true);

-- Create RLS policies for wallets table
-- Users can only access their own wallets
CREATE POLICY "Users can view their own wallets" ON public.wallets
    FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can manage their own wallets" ON public.wallets
    FOR ALL USING (auth.uid()::text = "userId");

-- Service role can manage all wallets
CREATE POLICY "Service role can manage all wallets" ON public.wallets
    FOR ALL USING (auth.role() = 'service_role');

-- Create RLS policies for contacts table
-- Users can only access their own contacts
CREATE POLICY "Users can view their own contacts" ON public.contacts
    FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can manage their own contacts" ON public.contacts
    FOR ALL USING (auth.uid()::text = "userId");

-- Service role can manage all contacts
CREATE POLICY "Service role can manage all contacts" ON public.contacts
    FOR ALL USING (auth.role() = 'service_role');

-- Create RLS policies for rules table
-- Users can only access their own rules
CREATE POLICY "Users can view their own rules" ON public.rules
    FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can manage their own rules" ON public.rules
    FOR ALL USING (auth.uid()::text = "userId");

-- Service role can manage all rules
CREATE POLICY "Service role can manage all rules" ON public.rules
    FOR ALL USING (auth.role() = 'service_role');

-- Create RLS policies for executions table
-- Users can only access executions for their own rules
CREATE POLICY "Users can view their own executions" ON public.executions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.rules 
            WHERE rules.id = executions."ruleId" 
            AND rules."userId" = auth.uid()::text
        )
    );

CREATE POLICY "Users can manage their own executions" ON public.executions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.rules 
            WHERE rules.id = executions."ruleId" 
            AND rules."userId" = auth.uid()::text
        )
    );

-- Service role can manage all executions
CREATE POLICY "Service role can manage all executions" ON public.executions
    FOR ALL USING (auth.role() = 'service_role');

-- Create RLS policies for quotes table
-- Users can only access quotes for their own rules
CREATE POLICY "Users can view their own quotes" ON public.quotes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.rules 
            WHERE rules.id = quotes."ruleId" 
            AND rules."userId" = auth.uid()::text
        )
    );

CREATE POLICY "Users can manage their own quotes" ON public.quotes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.rules 
            WHERE rules.id = quotes."ruleId" 
            AND rules."userId" = auth.uid()::text
        )
    );

-- Service role can manage all quotes
CREATE POLICY "Service role can manage all quotes" ON public.quotes
    FOR ALL USING (auth.role() = 'service_role');

-- Create RLS policies for webhook_events table
-- Users can only access their own webhook events
CREATE POLICY "Users can view their own webhook events" ON public.webhook_events
    FOR SELECT USING (auth.uid()::text = "userId");

-- Allow webhooks to be created without user context (for incoming webhooks)
CREATE POLICY "Allow webhook creation" ON public.webhook_events
    FOR INSERT WITH CHECK (true);

-- Users can update their own webhook events
CREATE POLICY "Users can update their own webhook events" ON public.webhook_events
    FOR UPDATE USING (auth.uid()::text = "userId");

-- Service role can manage all webhook events
CREATE POLICY "Service role can manage all webhook events" ON public.webhook_events
    FOR ALL USING (auth.role() = 'service_role');

-- Create RLS policies for audit_logs table
-- Users can only view their own audit logs
CREATE POLICY "Users can view their own audit logs" ON public.audit_logs
    FOR SELECT USING (auth.uid()::text = "userId");

-- System can create audit logs for any user
CREATE POLICY "System can create audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- Service role can manage all audit logs
CREATE POLICY "Service role can manage all audit logs" ON public.audit_logs
    FOR ALL USING (auth.role() = 'service_role');

-- Create RLS policies for security_alerts table
-- Users can only view their own security alerts
CREATE POLICY "Users can view their own security alerts" ON public.security_alerts
    FOR SELECT USING (auth.uid()::text = "userId");

-- Users can update their own security alerts (to mark as resolved)
CREATE POLICY "Users can update their own security alerts" ON public.security_alerts
    FOR UPDATE USING (auth.uid()::text = "userId");

-- System can create security alerts for any user
CREATE POLICY "System can create security alerts" ON public.security_alerts
    FOR INSERT WITH CHECK (true);

-- Service role can manage all security alerts
CREATE POLICY "Service role can manage all security alerts" ON public.security_alerts
    FOR ALL USING (auth.role() = 'service_role');