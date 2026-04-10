async function testFetch() {
  const url = 'https://smoothcomp.com/en/events/upcoming?countries=CZ';
  console.log(`Fetching ${url} ...`);
  try {
    const html = await fetch(url).then(r => r.text());
    
    // Look for any href starting with /en/event/
    let eventUrls = [];
    const rx = /href="([^"]+\/en\/event\/\d+)"/g;
    let match;
    while ((match = rx.exec(html)) !== null) {
      // It might be a full URL or a relative URL
      let link = match[1];
      if (link.startsWith('/')) {
        link = 'https://smoothcomp.com' + link;
      }
      eventUrls.push(link);
    }

    // fallback matching for event covers
    if (eventUrls.length === 0) {
      console.log('No links found with strict regex, trying looser regex');
      const looseRx = /href="([^"]*event\/\d+[^"]*)"/g;
      while ((match = looseRx.exec(html)) !== null) {
        eventUrls.push(match[1]);
      }
    }

    eventUrls = [...new Set(eventUrls)];

    console.log(`Found ${eventUrls.length} unique event links.`);
    if (eventUrls.length > 0) {
      console.log('Sample:', eventUrls.slice(0, 10));
    }
  } catch (e) {
    console.error(e.message);
  }
}

testFetch();
