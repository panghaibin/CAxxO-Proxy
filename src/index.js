import { Response_ } from "./res";
import { CasioProxy } from "./proxy";

const blockedCountry = ['JP'];
const allowedIP = ['127.0.0.1'];

async function handleRequest(request) {
  const { protocol, hostname, pathname, href, origin } = new URL(request.url);

  if (pathname === '/robots.txt') {
    return Response_.text('User-agent: *\nDisallow: /');
  }

  const country = request.cf.country;
  const ip = request.headers.get('CF-Connecting-IP');
  if (blockedCountry.indexOf(country) !== -1 && allowedIP.indexOf(ip) === -1) {
    return Response_.forbidden('Access Denied');
  }

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
