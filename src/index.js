const blockedCountry = ['JP'];
const allowedIP = ['127.0.0.1'];


class Response_ {
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
}

async function supportFetch(pathname) {
  const url = `https://support.casio.com${pathname}`;
  const res = await fetch(url);

  if (!res.ok) {
    return Response_.notFound();
  }

  const contentType = res.headers.get('Content-Type');
  if (contentType.indexOf('text/html') === -1) {
    return res;
  }

  let html = await res.text();
  html = html.replace(/https:\/\/support\.casio\.com/g, '');
  html = html.replace(/<!-- Google Tag Manager -->[\s\S]*?<!-- End Google Tag Manager -->/g, '');
  html = html.replace(/<!-- Google Tag Manager \(noscript\) -->[\s\S]*?<!-- End Google Tag Manager \(noscript\) -->/g, '');
  html = html.replace(/<!-- Adobe analytics Tag -->[\s\S]*?<!-- END Adobe analytics Tag -->/g, '');

  return Response_.html(html);
}

async function handleRequest(request) {
  const country = request.cf.country;
  const ip = request.headers.get('CF-Connecting-IP');
  if (blockedCountry.indexOf(country) !== -1 && allowedIP.indexOf(ip) === -1) {
    return Response_.forbidden('Access Denied');
  }

  const { hostname, pathname } = new URL(request.url);

  if (['support.casio.com.caduo.ml', 'support.casio.caduo.ml'].indexOf(hostname) !== -1) {
    return Response_.redirectForever('https://support.caduo.ml' + pathname);
  }

  if (pathname === '/') {
    return Response_.html('Hello World');
  }

  return supportFetch(pathname);
}

addEventListener('fetch', function (event) {
  event.respondWith(handleRequest(event.request));
});
