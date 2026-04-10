async function test() {
  const baseUrl = "https://smoothcomp.com";
  const eventId = 28098;

  console.log("1. GET /results");
  const getRes = await fetch(`${baseUrl}/en/event/${eventId}/results`);
  
  // node-fetch / undici returns multiple cookies separated by comma.
  // Wait, in Node fetch, set-cookie might be a concatenated string or `getSetCookie()` method exists.
  const cookies = getRes.headers.getSetCookie ? getRes.headers.getSetCookie().join('; ') : getRes.headers.get("set-cookie");
  const html = await getRes.text();
  const tokenMatch = html.match(/<meta name="csrf-token" content="([^"]+)"/);
  const token = tokenMatch ? tokenMatch[1] : "";

  console.log("Token:", token);
  // console.log("Cookies:", cookies);

  console.log("2. POST /results/getResults");
  const response = await fetch(`${baseUrl}/en/event/${eventId}/results/getResults`, {
    method: "POST",
    headers: {
      "cookie": cookies || "",
      "x-csrf-token": token,
      "content-type": "application/json",
      "accept": "application/json"
    }
  });

  console.log("Status:", response.status);
  const data = await response.json();
  console.log("Data keys:", Object.keys(data));
  if (data.eventResults) {
    console.log("Event categories found:", data.eventResults.length);
  }
}

test().catch(console.error);
