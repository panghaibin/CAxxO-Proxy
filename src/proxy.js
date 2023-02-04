import { Response_ } from "./res";

export class CasioProxy {
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
    html = html.replace(/<script .*?assets\.adobedtm\.com\/[\s\S]*?<\/script>/g, '<!-- 04 -->');
    html = html.replace(/\(function[\s\S]*?gtm\.js[\s\S]*?<\/script>/g, '/* 05 */</script>');
    html = html.replace(/window.adobeDataLayer[\s\S]*?<\/script>/g, '/* 06 */</script>');
    html = html.replace(/<noscript>[\s\S]*?<iframe[\s\S]*?googletagmanager[\s\S]*?<\/noscript>/g, '<!-- 07 -->');
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
