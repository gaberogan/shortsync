# ShortSync

ShortSync App

## Quick start

```bash
# Install dependencies
npm install

# Create .dev.vars and fill with your values or ask teammate for theirs
cp .dev.vars.example .dev.vars

# Initialize backend database locally
sudo npm run migrate

# Run dev server
# sudo required to run on https://dev.shortsync.app without a port aka port 443
sudo npm run dev
```

## Build for production

1. Create account at cloudflare.com
2. Create a Cloudflare Pages app and link to this GitHub repo
3. Create a D1 database in Cloudflare
4. Run `npm run migrate` but remove `--local` from the command to migrate D1 in production
5. (optional) Run `npm run category-embeddings` to update Youtube category embeddings
