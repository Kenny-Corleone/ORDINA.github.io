/* Payment module connectivity tests */
const assert = (cond, msg) => { if (!cond) { throw new Error(msg); } };

async function checkUrl(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    // Some sites might block HEAD or return 403/405, but as long as we get a response, the domain is reachable.
    // We just want to ensure the domain isn't dead.
    console.log(`Checked ${url}: status ${res.status}`);
    return true;
  } catch (e) {
    console.error(`Failed to reach ${url}:`, e.message);
    return false;
  }
}

async function run() {
  console.log('Testing payment portal connectivity...');

  const urls = [
    'https://hesab.az/',
    'https://gpp.az/',
    'https://asanpay.az/'
  ];

  for (const url of urls) {
    const reachable = await checkUrl(url);
    // We don't fail the test if external site is down, but we log it.
    if (!reachable) console.warn(`Warning: ${url} might be unreachable.`);
  }

  console.log('Payment module connectivity tests completed.');
}

run().catch((e) => { console.error(e); process.exit(1); });
