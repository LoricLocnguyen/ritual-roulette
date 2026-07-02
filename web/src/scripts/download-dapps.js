const fs = require('fs');
const path = require('path');

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1-71yrtMqSRCTAvmshY2K_wDSYproX7GQFybKwkC5IFM/export?format=csv&gid=0';
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'ritual-dapp-list.json');

// Simple CSV parser that handles quotes and commas
function parseCSV(text) {
  const lines = text.split(/\r?\n/);
  const result = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const row = [];
    let inQuotes = false;
    let currentField = '';
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        row.push(currentField.trim());
        currentField = '';
      } else {
        currentField += char;
      }
    }
    row.push(currentField.trim());
    result.push(row);
  }
  return result;
}

// Inferred precompiles based on name/URL analysis
function inferPrecompiles(name, url) {
  const combined = (name + ' ' + url).toLowerCase();
  const precompiles = [];
  const details = {};

  if (combined.includes('judge') || combined.includes('bounty') || combined.includes('ai') || combined.includes('gpt') || combined.includes('chat') || combined.includes('copilot') || combined.includes('llm') || combined.includes('divination') || combined.includes('horoscope') || combined.includes('fortune') || combined.includes('omen') || combined.includes('consult')) {
    precompiles.push('0x0802');
    details['0x0802'] = 'LLM Inference Precompile (Generates text or analytical responses on-chain)';
  }
  
  if (combined.includes('pfp') || combined.includes('card') || combined.includes('image') || combined.includes('banner') || combined.includes('art') || combined.includes('avatar') || combined.includes('pixel') || combined.includes('paint') || combined.includes('badge')) {
    precompiles.push('0x0818');
    details['0x0818'] = 'Multimodal Precompile (Generates images/NFT media dynamically on-chain)';
  }

  if (combined.includes('tracker') || combined.includes('feed') || combined.includes('news') || combined.includes('monitor') || combined.includes('oracle') || combined.includes('price')) {
    precompiles.push('0x0801');
    details['0x0801'] = 'HTTP Precompile (Fetches external web API data directly to smart contracts)';
  }

  if (combined.includes('agent') || combined.includes('bot') || combined.includes('spawn') || combined.includes('autonomous')) {
    precompiles.push('0x0820');
    details['0x0820'] = 'Agent Lifecycle Precompile (Spawns and manages autonomous TEE-based agents)';
  }

  if (combined.includes('identity') || combined.includes('proof') || combined.includes('sign') || combined.includes('crypt') || combined.includes('secure') || combined.includes('stealth')) {
    precompiles.push('0x0009');
    details['0x0009'] = 'Ed25519/DKMS Cryptography Precompile (Enables enclave-secured keys and zero-knowledge signatures)';
  }

  if (combined.includes('schedule') || combined.includes('cron') || combined.includes('routine') || combined.includes('time')) {
    precompiles.push('Scheduler');
    details['Scheduler'] = 'Autonomous Scheduler (Trigger smart contract executions automatically without external keepers)';
  }

  // Fallback if no specific tags inferred
  if (precompiles.length === 0) {
    precompiles.push('EVM Core');
    details['EVM Core'] = 'Standard EVM Layer (Integrates standard smart contract execution without advanced AI precompiles)';
  }

  return { precompiles, details };
}

async function run() {
  try {
    console.log('Fetching Google Sheet CSV...');
    const response = await fetch(SHEET_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch sheet: ${response.statusText}`);
    }
    const csvText = await response.text();
    const rows = parseCSV(csvText);
    
    // Header check
    // Row 0 is App Name, App Name, App Owners, ...
    console.log(`Successfully parsed ${rows.length} rows.`);
    
    const dapps = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 2) continue;
      
      let url = row[0];
      const name = row[1];
      const owner = row[2] || '';
      
      // Ignore header lookalikes or instructional rows
      if (url.toLowerCase().includes('app name') || url.toLowerCase().includes('always use your testnet')) {
        continue;
      }
      
      if (!url || !name) continue;
      
      // Clean target url
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      const id = `dapp_${i}`;
      const cleanOwner = owner.replace(/^@/, '').trim();
      
      // Checking for review-blocked flags
      const isSiggyPussy = url.includes('pussy');
      const isHaezl = url.includes('haezl-trading');
      
      const needsReview = isSiggyPussy || isHaezl;
      const active = !needsReview;
      
      const parsedOwner = cleanOwner || null;
      
      // Stack deduction
      const stack = inferPrecompiles(name, url);
      
      dapps.push({
        id,
        name,
        url,
        description: `Explore ${name} on the Ritual Testnet. Built by ${parsedOwner || 'anonymous developer'}.`,
        creator: {
          name: parsedOwner ? `@${parsedOwner}` : 'Unknown Builder',
          inferred_creator_handle: parsedOwner,
          handle_verified: parsedOwner === 'cozfuttu', // The workshop author is verified, others are inferred
          social_url: parsedOwner ? `https://x.com/${parsedOwner}` : null
        },
        ritual_stack: {
          precompiles: stack.precompiles,
          details: stack.details
        },
        needs_review: needsReview,
        active: active
      });
    }

    // Ensure output directory exists
    const dir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(dapps, null, 2));
    console.log(`Saved ${dapps.length} compiled dApps to ${OUTPUT_FILE}`);
  } catch (error) {
    console.error('Error running script:', error);
  }
}

run();
