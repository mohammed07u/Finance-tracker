# Finance Tracker

A personal finance tracker built as a React artifact for Claude.ai.

## Features
- Dashboard: net worth by account type, 6-month income vs expense chart, category breakdown, recent activity
- Accounts: track bank, share market, other platforms, and cash balances
- Transactions: log salary credits and expenses, linked to accounts (balances auto-update)
- Insights: savings rate, emergency fund coverage, invested share of net worth, personalized nudges
- Guide: practical money habits (emergency fund, 50/30/20 rule, SIPs, diversification, debt, etc.)

## How to use
Open `finance-tracker.jsx` in Claude.ai as an artifact (paste its contents into a new React artifact, or
upload/reference it in a conversation and ask Claude to render it). Data persists automatically via
Claude's artifact storage, scoped privately to you.

## Tech
- React (function components + hooks)
- recharts for charts
- lucide-react for icons
- window.storage API for persistence (no backend needed)
