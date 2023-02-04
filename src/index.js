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

class CasioProxy {
  static async handleRequest(request) {
    const { hostname } = new URL(request.url);
    const subDomain = hostname.split('.')[0];

    if (['support', 'world'].indexOf(subDomain) !== -1) {
      return await this.handleGeneralRequest(request);
    }

    return Response_.notFound();
  }

  static removeRubbish(html) {
    html = html.replace(/<!-- Google Tag Manager -->[\s\S]*?<!-- End Google Tag Manager -->/g, '<!-- 01 -->');
    html = html.replace(/<!-- Google Tag Manager \(noscript\) -->[\s\S]*?<!-- End Google Tag Manager \(noscript\) -->/g, '<!-- 02 -->');
    html = html.replace(/<!-- Adobe analytics Tag -->[\s\S]*?<!-- END Adobe analytics Tag -->/g, '<!-- 03 -->');
    html = html.replace(/<script src="\/\/assets\.adobedtm\.com\/[\s\S]*?<\/script>/g, '<!-- 04 -->');
    html = html.replace(/\(function[\s\S]*?gtm\.js[\s\S]*?<\/script>/g, '</script>');
    html = html.replace(/<noscript>[\s\S]*?<iframe[\s\S]*?googletagmanager[\s\S]*?<\/noscript>/g, '<!-- 05 -->');
    return html;
  }

  static URLRewrite(res) {
    res = res.replace(/https?:\/\/support\.casio\.com/g, 'https://support.caduo.ml');
    res = res.replace(/https?:\/\/world\.casio\.com/g, 'https://world.caduo.ml');
    return res;
  }

  static async handleGeneralRequest(request) {
    const { href, origin, hostname } = new URL(request.url);
    const subDomain = hostname.split('.')[0];
    const url = href.replace(origin, `https://${subDomain}.casio.com`);
    const res = await fetch(url);

    if (!res.ok) {
      return Response_.notFound('Origin Error');
    }

    if (res.url !== url) {
      return Response_.redirect(this.URLRewrite(res.url));
    }

    const contentType = res.headers.get('Content-Type');
    if (contentType.indexOf('text/html') === -1) {
      return res;
    }

    let html = await res.text();
    html = this.URLRewrite(html);
    html = this.removeRubbish(html);
    return Response_.html(html);
  }
}

async function handleRequest(request) {
  const country = request.cf.country;
  const ip = request.headers.get('CF-Connecting-IP');
  if (blockedCountry.indexOf(country) !== -1 && allowedIP.indexOf(ip) === -1) {
    return Response_.forbidden('Access Denied');
  }

  const { protocol, hostname, href, origin } = new URL(request.url);

  if (protocol !== 'https:' && allowedIP.indexOf(ip) === -1 && hostname.indexOf('casio') === -1) {
    return Response_.redirect(href.replace(protocol, 'https:'));
  }

  if (hostname.indexOf('casio') !== -1) {
    const subDomain = hostname.split('.')[0];
    return Response_.redirect(href.replace(origin, `https://${subDomain}.caduo.ml`));
  }

  return await CasioProxy.handleRequest(request);
}

addEventListener('fetch', function (event) {
  event.respondWith(handleRequest(event.request));
});
