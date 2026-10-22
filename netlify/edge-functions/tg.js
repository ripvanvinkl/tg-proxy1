export default async (request) => {
  const url = new URL(request.url);

  if (url.pathname === "/ping") {
    return new Response("pong-edge-alive\n", { status: 200 });
  }

  if (!url.pathname.includes("/bot")) {
    return new Response("Not found", { status: 404 });
  }

  const targetUrl = "https://api.telegram.org" + url.pathname + url.search;

  // Формируем чистые заголовки
  const headers = new Headers();
  for (const [key, value] of request.headers.entries()) {
    const lower = key.toLowerCase();
    if (
      lower === "host" ||
      lower === "content-length" ||
      lower.startsWith("x-nf-") ||
      lower.startsWith("x-forwarded-")
    ) {
      continue;
    }
    headers.set(key, value);
  }

  let body = null;
  if (request.method !== "GET" && request.method !== "HEAD") {
    body = await request.arrayBuffer();
    // Явно указываем точный размер файла в байтах для Telegram API
    headers.set("Content-Length", body.byteLength.toString());
  }

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body: body,
    });

    const resText = await response.text();
    const resHeaders = new Headers();
    resHeaders.set("Content-Type", response.headers.get("Content-Type") || "application/json");
    resHeaders.set("x-edge-status", "active");

    return new Response(resText, {
      status: response.status,
      headers: resHeaders,
    });
  } catch (err) {
    return new Response("Edge Fetch Error: " + err.message, { status: 502 });
  }
};
