export default async (request) => {
  const url = new URL(request.url);

  // Проверочный эндпоинт
  if (url.pathname === "/ping") {
    return new Response("pong-edge-alive", { status: 200 });
  }

  if (!url.pathname.includes("/bot")) {
    return new Response("Not found", { status: 404 });
  }

  const targetUrl = "https://api.telegram.org" + url.pathname + url.search;

  // Очищаем заголовки: убираем старый Host и Content-Length,
  // чтобы Telegram не зависал в ожидании потока
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
  }

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body: body,
    });

    const resHeaders = new Headers(response.headers);
    resHeaders.set("x-edge-status", "active");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: resHeaders,
    });
  } catch (err) {
    return new Response("Edge Fetch Error: " + err.message, { status: 502 });
  }
};
