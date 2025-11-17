-- Caption Generator Database Schema

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    email_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Plans table
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    caption_limit INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    billing_period VARCHAR(50) DEFAULT 'monthly',
    features JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    start_date TIMESTAMP NOT NULL DEFAULT NOW(),
    end_date TIMESTAMP,
    auto_renew BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Caption usage tracking table
CREATE TABLE IF NOT EXISTS caption_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    captions_generated INTEGER NOT NULL DEFAULT 0,
    last_generated_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create composite index for efficient usage queries
CREATE INDEX IF NOT EXISTS idx_caption_usage_user_period ON caption_usage(user_id, period_start, period_end);

-- Payment history table (for future use)
CREATE TABLE IF NOT EXISTS payment_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL,
    payment_method VARCHAR(100),
    transaction_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index for payment history queries
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);

-- Insert default plans
INSERT INTO plans (name, caption_limit, price, billing_period, features) VALUES
    ('Free', 10, 0.00, 'monthly', '{"features": ["10 captions per month", "Basic image analysis", "Standard tone options"]}'),
    ('Basic', 100, 9.99, 'monthly', '{"features": ["100 captions per month", "Advanced image analysis", "All tone options", "Priority support"]}'),
    ('Pro', 500, 29.99, 'monthly', '{"features": ["500 captions per month", "Advanced image & video analysis", "All tone options", "Custom hashtag count", "Priority support", "API access"]}'),
    ('Enterprise', 999999, 99.99, 'monthly', '{"features": ["Unlimited captions", "Advanced image & video analysis", "All tone options", "Custom hashtag count", "Dedicated support", "API access", "Custom integrations"]}')
ON CONFLICT (name) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create usage record for new subscription
CREATE OR REPLACE FUNCTION create_initial_usage_record()
RETURNS TRIGGER AS $$
DECLARE
    period_start_date TIMESTAMP;
    period_end_date TIMESTAMP;
BEGIN
    period_start_date := DATE_TRUNC('month', NOW());
    period_end_date := period_start_date + INTERVAL '1 month';
    
    INSERT INTO caption_usage (user_id, period_start, period_end, captions_generated)
    VALUES (NEW.user_id, period_start_date, period_end_date, 0)
    ON CONFLICT DO NOTHING;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic usage record creation
CREATE TRIGGER create_usage_on_subscription AFTER INSERT ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION create_initial_usage_record();

-- Create view for easy subscription queries
CREATE OR REPLACE VIEW active_subscriptions AS
SELECT 
    s.id as subscription_id,
    s.user_id,
    u.email,
    u.full_name,
    p.name as plan_name,
    p.caption_limit,
    s.status,
    s.start_date,
    s.end_date,
    COALESCE(cu.captions_generated, 0) as captions_used,
    p.caption_limit - COALESCE(cu.captions_generated, 0) as captions_remaining
FROM subscriptions s
JOIN users u ON s.user_id = u.id
JOIN plans p ON s.plan_id = p.id
LEFT JOIN caption_usage cu ON cu.user_id = s.user_id 
    AND cu.period_start <= NOW() 
    AND cu.period_end >= NOW()
WHERE s.status = 'active';

-- Grant permissions (adjust as needed for production)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO caption_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO caption_app_user;

