# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Discord bot application for automatic credit checking and notifications. The bot monitors postpaid company credits and sends Discord messages with interactive buttons when credits are low or when credits are added.

## Build and Run Commands

```bash
# Build the TypeScript project
npm run build

# Start the bot (builds and runs with pino-pretty logging)
npm start

# Start with pm2 process manager
npm run start:pm2

# Stop pm2 process
npm run stop

# Restart (stop + start)
npm run restart
```

## Environment Variables

Required `.env` variables:

-   `DISCORD_TOKEN`: Bot token from Discord Developer Portal
-   `CHANNEL_ID`: Discord channel ID for notifications
-   `POSTGRES_HOST`: PostgreSQL database host
-   `POSTGRES_PORT`: PostgreSQL database port
-   `POSTGRES_USER`: PostgreSQL username
-   `POSTGRES_PASSWORD`: PostgreSQL password
-   `POSTGRES_DB`: PostgreSQL database name
-   `NODE_ENV`: Environment mode (production/development) - affects SSL settings
-   `LOG_LEVEL`: Logging level (default: "info")

## Architecture

### Path Aliases

The project uses TypeScript path aliases (configured in `tsconfig.json`):

-   `@repositories`: Database query functions
-   `@services`: Business logic services
-   `@utils`: Utilities (logger, helpers)
-   `@types`: Type definitions
-   `@database`: Database connection management
-   `@discord`: Discord bot class and utilities

After build, `tsc-alias` resolves these aliases to relative paths in the compiled output.

### Core Components

**DiscordBot Class** (`src/discord/discord-bot.ts`):

-   OOP-based Discord.js wrapper for reusability
-   Manages bot lifecycle (start, connection, ready state, shutdown)
-   Registers and manages slash commands (`/status`, `/user-info`)
-   `sendMessage()`: Sends embedded messages with two action buttons (Accept/Ignore)
-   `buttonInteractionListener()`: Handles button clicks and updates embed colors based on action
-   `disconnect()`: Gracefully disconnects from Discord Gateway and cleans up resources

**Slash Commands** (`src/discord/slash-commands/`):

-   `/status` (`health-command.ts`): Fetches and displays database health information as JSON
-   `/user-info` (`user-info.ts`): Returns information about the user who executed the command
-   Commands are registered globally on bot startup
-   Uses Discord's deferred reply pattern for async operations

**Button Handlers** (`src/discord/button-handlers/`):

-   `basicHandler()` (`basic-buttons.ts`): Handles interactions with Accept and Ignore buttons
-   "Accept" button (accept_button): Fetches health info and changes embed to green (0x008a09)
-   "Ignore" button (ignore_button): Dismisses the notification and changes embed to red (0xff0000)
-   Removes buttons after interaction to prevent duplicate actions

**Database Layer** (`src/database/postgres.ts`):

-   Singleton connection pool pattern via `getPool()`
-   Lazily initializes pool on first call using environment variables
-   Connection parameters: host, port, user, password, database
-   SSL configuration adapts based on NODE_ENV (production vs development)
-   Returns the same pool instance for all subsequent queries
-   `closePool()`: Safely closes all database connections in the pool during shutdown

**Repository Layer** (`src/repositories/`):

-   `getHealthInfo()` (`health.ts`): Queries database health metrics including:
    -   PostgreSQL server version
    -   Maximum connection limit
    -   Current open connections count
    -   Returns structured HealthInfo object with timestamp

### Application Flow

1. **Initialization** (`src/app.ts`):

    - Loads environment variables via dotenv
    - Creates DiscordBot instance with target channel ID
    - Registers signal handlers for graceful shutdown (SIGINT/SIGTERM)
    - Starts bot and waits for ready state
    - Sends test message to verify operational status

2. **Database Operations**:

    - All database queries use parameterized queries to prevent SQL injection
    - Connection pool is shared across all queries
    - Database credentials loaded from environment variables
    - Lazy initialization: pool created on first database query

3. **Discord Messaging**:

    - Messages sent as embeds with custom fields
    - Two buttons attached: "Accept" (green) and "Ignore" (red)
    - Button interactions update embed color: green (0x008a09) for accepted, red (0xff0000) for ignored
    - Buttons are removed after interaction

4. **Graceful Shutdown** (`src/app.ts`):
    - Triggered by SIGINT (Ctrl+C), SIGTERM (kill command), or application errors
    - `gracefulShutdown()` function orchestrates cleanup sequence:
        1. Logs the shutdown signal received
        2. Disconnects Discord bot via `disconnect()` method
        3. Closes database connection pool via `closePool()` function
        4. Logs successful shutdown
        5. Exits process with appropriate code (0 for success, 1 for error)
    - Ensures all resources are properly cleaned up before process termination
    - Prevents orphaned connections and incomplete operations

## Database Schema Context

**Current Implementation:**

-   `pg_stat_activity`: System table queried for database health monitoring (connection counts, activity)

**Planned/Future Schema** (referenced in Project Overview):

-   `plataforma.companies`: Company records with `credit_mode_of_use` field
-   `plataforma.companies_contracts`: Contract details including `auto_refill` and `bureaus`
-   `billing.txn_prod`: Credit transactions table for tracking credit additions/usage

## Logging

Uses Pino for structured, asynchronous logging with `pino-pretty` for formatted console output.
