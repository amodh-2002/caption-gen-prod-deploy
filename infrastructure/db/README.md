# Database Schema

PostgreSQL database schema for Caption Generator application.

## Tables

### users
Stores user account information and authentication credentials.
- `id`: UUID primary key
- `email`: Unique email address
- `password_hash`: Bcrypt hashed password
- `full_name`: User's full name
- `created_at`: Account creation timestamp
- `email_verified`: Email verification status
- `last_login`: Last login timestamp

### plans
Subscription plans available to users.
- `id`: UUID primary key
- `name`: Plan name (Free, Basic, Pro, Enterprise)
- `caption_limit`: Monthly caption generation limit
- `price`: Plan price
- `billing_period`: Billing cycle (monthly/yearly)
- `features`: JSON object with plan features
- `is_active`: Whether plan is available

### subscriptions
User subscription records linking users to plans.
- `id`: UUID primary key
- `user_id`: Reference to users table
- `plan_id`: Reference to plans table
- `status`: Subscription status (active, cancelled, expired)
- `start_date`: Subscription start date
- `end_date`: Subscription end date (if applicable)
- `auto_renew`: Auto-renewal flag

### caption_usage
Tracks caption generation usage per user per billing period.
- `id`: UUID primary key
- `user_id`: Reference to users table
- `period_start`: Billing period start date
- `period_end`: Billing period end date
- `captions_generated`: Number of captions generated in period
- `last_generated_at`: Timestamp of last caption generation

### payment_history
Records payment transactions (for future implementation).
- `id`: UUID primary key
- `user_id`: Reference to users table
- `subscription_id`: Reference to subscriptions table
- `amount`: Payment amount
- `currency`: Currency code (USD, EUR, etc.)
- `status`: Payment status (completed, failed, pending)
- `transaction_id`: External payment provider transaction ID

## Views

### active_subscriptions
Convenient view combining user, subscription, plan, and usage data for active subscriptions.

## Triggers

1. **update_updated_at_column**: Automatically updates `updated_at` timestamp on record modification
2. **create_initial_usage_record**: Creates initial caption usage record when subscription is created

## Initialization

The `init.sql` script:
1. Creates all tables with proper constraints and indexes
2. Inserts default subscription plans (Free, Basic, Pro, Enterprise)
3. Creates helper functions and triggers
4. Sets up the active_subscriptions view

## Usage with Docker

The init script will automatically run when the PostgreSQL container starts for the first time:

```bash
docker-compose up -d postgres
```

## Manual Execution

```bash
psql -h localhost -U postgres -d caption_gen -f init.sql
```

## Migrations

For production, consider using a migration tool like:
- Alembic (Python)
- Flyway
- Liquibase

This ensures version-controlled, incremental schema changes.

