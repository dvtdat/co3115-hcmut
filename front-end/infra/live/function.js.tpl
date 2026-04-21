function handler(event) {
  var request = event.request;
  var headers = request.headers;
  var authHeader = headers.authorization;

  if (!authHeader || authHeader.value !== "Basic ${credentials_base64}") {
    return {
      statusCode: 401,
      statusDescription: "Unauthorized",
      headers: {
        "www-authenticate": { value: 'Basic realm="Tolerant - ${env_name}"' },
      },
    };
  }

  return request;
}
