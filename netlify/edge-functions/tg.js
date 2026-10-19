export default async (request) => {
  try {
    const url = new URL(request.url);

    // Проверяем, что запрос к Telegram
    if (!url.pathname.includes("/bot")) {
      return new Response("Not found", { status: 404 });
    }

    const targetUrl = new URL(url.pathname + url.search, "https://api.telegram.org");

    // Копируем заголовки и выставляем Host
    const headers = new Headers(request.headers);
    headers.set("Host", "api.telegram.org");

    let body = null;
    if (request.method !== "GET" && request.method !== "HEAD") {
      body = await request.arrayBuffer();
    }

    const response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: headers,
      body: body,
    });

    return response;
  } catch (err) {
    return new Response("Edge Error: " + err.message, { status: 500 });
  }
};
