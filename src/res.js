export class Response_ {
  static redirect(url) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: url,
      },
    });
  }

  static redirectForever(url) {
    return new Response(null, {
      status: 301,
      headers: {
        Location: url,
      },
    });
  }

  static notFound() {
    return new Response('Not Found', {
      status: 404,
    });
  }

  static forbidden(msg = 'Forbidden') {
    return new Response(msg, {
      status: 403,
    });
  }

  static html(data) {
    return new Response(data, {
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
      },
    });
  }

  static json(data) {
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    });
  }

  static js(data) {
    return new Response(data, {
      headers: {
        'Content-Type': 'application/javascript;charset=UTF-8',
      },
    });
  }

  static text(data) {
    return new Response(data, {
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8',
      },
    });
  }
}
