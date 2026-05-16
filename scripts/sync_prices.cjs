const https = require('https');
const fs = require('fs');
const path = require('path');

// Read environment
const envPath = path.join(__dirname, '..', '.env.openshop');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envLines = envContent.split('\n');

const env = {};
for (const line of envLines) {
  const match = line.match(/^(\w+)=(.*)$/);
  if (match) {
    env[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
}

const STRIPE_SECRET_KEY = env.STRIPE_SECRET_KEY;
const KV_NAMESPACE_ID = '0f23f06b72d043d4b3d2e014695958a3';

// Correct prices from Stripe (in cents)
const correctPrices = {
  'price_1TStGsJWJQ6OWL6iO3GkPELi': 999,   // Professional Resume Template Bundle: $9.99
  'price_1TStH5JWJQ6OWL6iv5jHASgT': 999,   // Modern Pitch Deck Template: $9.99
  'price_1TStHGJWJQ6OWL6iePIK0EEx': 999,   // Premium UI Icon Pack: $9.99
  'price_1TStHQJWJQ6OWL6i3br16tiz': 699,   // Modern Gradient Backgrounds Pack: $6.99
  'price_1TStGiJWJQ6OWL6iAv7PANR2': 999,   // The Complete Guide to Remote Work: $9.99
  'price_1TStGZJWJQ6OWL6ifMMWmmjZ': 999,   // AI Prompt Library: $9.99
  'price_1TStHZJWJQ6OWL6i9SKMzHe4': 999,   // Notion Ultimate Bundle: $9.99
  'price_1TStHiJWJQ6OWL6iF6wj7VoX': 1499,  // Figma Masterclass: $14.99
};

// Stripe API helper
function stripeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.stripe.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(`Stripe API error: ${json.error?.message || data}`));
          } else {
            resolve(json);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// Fetch products from website API
function fetchProducts() {
  return new Promise((resolve, reject) => {
    https.get('https://scsc.qzz.io/api/products', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('=== Syncing KV Prices with Stripe ===\n');

  // Fetch current products from API
  const products = await fetchProducts();
  console.log(`Found ${products.length} products in KV\n`);

  // Build wrangler commands for price updates
  const updates = [];
  
  for (const product of products) {
    const stripePriceId = product.stripePriceId;
    const currentPrice = product.price; // in cents
    const correctPrice = correctPrices[stripePriceId];

    if (!correctPrice) {
      console.log(`⚠️  ${product.name}: Unknown Stripe price ID ${stripePriceId}`);
      continue;
    }

    if (currentPrice === correctPrice) {
      console.log(`✓ ${product.name}: Price already correct ($${correctPrice/100})`);
      continue;
    }

    console.log(`→ ${product.name}: $${currentPrice/100} → $${correctPrice/100}`);

    // Update product object
    product.price = correctPrice;

    updates.push({
      key: `product:${product.id}`,
      value: JSON.stringify(product)
    });
  }

  if (updates.length === 0) {
    console.log('\n✅ All prices already synced!');
    return;
  }

  console.log(`\n${updates.length} products need price updates.`);

  // Write update script
  const scriptPath = path.join(__dirname, 'update_kv_prices.ps1');
  let script = `$updates = @(\n`;
  for (const u of updates) {
    script += `  @{key="${u.key}"; value=@'\n${u.value}\n'@}\n`;
  }
  script += `)\n\n`;
  script += `foreach ($u in $updates) {\n`;
  script += `  $tempFile = [System.IO.Path]::GetTempFileName()\n`;
  script += `  $u.value | Out-File -FilePath $tempFile -Encoding utf8\n`;
  script += `  npx wrangler kv key put --namespace-id ${KV_NAMESPACE_ID} $u.key --path $tempFile\n`;
  script += `  Remove-Item $tempFile\n`;
  script += `}\n`;

  fs.writeFileSync(scriptPath, script, 'utf-8');
  console.log(`\nPowerShell script written to: ${scriptPath}`);
  console.log('Run it to update KV prices.');
}

main().catch(console.error);
