export default async (request) => {
  const url = new URL(request.url);

  if (!url.pathname.startsWith("/bot")) {
    return new Response("Not found", { status: 404 });
  }

  const targetUrl = new URL(url.pathname + url.search, "https://api.telegram.org");

  // 1. Вычитываем тело (график) целиком в память
  const body = (request.method !== "GET" && request.method !== "HEAD")
    ? await request.arrayBuffer()
    : null;

  // 2. Передаем ТОЛЬКО Content-Type (он содержит boundary файла).
  // Content-Length и Host движок выставит сам точно под размер буфера.
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }

  return await fetch(targetUrl.toString(), {
    method: request.method,
    headers: headers,
    body: body,
  });
};
