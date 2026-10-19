export default async (request) => {
  const url = new URL(request.url);

  // Проверяем, что запрос идет к Telegram
  if (!url.pathname.startsWith("/bot")) {
    return new Response("Not found", { status: 404 });
  }

  const targetUrl = new URL(url.pathname + url.search, "https://api.telegram.org");

  const headers = new Headers(request.headers);
  headers.set("Host", "api.telegram.org");

  return await fetch(targetUrl.toString(), {
    method: request.method,
    headers: headers,
    body: request.body,
  });
};
