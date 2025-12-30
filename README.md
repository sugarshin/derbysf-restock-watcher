# derbysf-restock-watcher

A stock monitoring system for Derby SF that sends Pushover notifications when items are restocked.

## Monitored Product

- [Classical Derby Black - Size L](https://www.derbysf.com/ja-jp/collections/classic-derby-jacket-style-300/products/classical-derby-black?variant=924781853)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure GitHub Secrets

Go to Settings > Secrets and variables > Actions and add:

| Secret Name | Description |
|-------------|-------------|
| `PUSHOVER_API_TOKEN` | Pushover API token |
| `PUSHOVER_USER_KEY` | Pushover user key |

### 3. Local Testing

```bash
# Set environment variables
export PUSHOVER_API_TOKEN=your_token
export PUSHOVER_USER_KEY=your_key

# Dry run (no notifications sent)
npm run check:dry

# Run
npm run check
```

## How It Works

1. GitHub Actions runs every 30 minutes
2. Fetches stock data from Shopify JSON API
3. Falls back to HTML parsing if blocked by WAF
4. Determines restock when `inventory_quantity > 0`
5. Sends notification via Pushover

## License

[Unlicense](LICENSE)
