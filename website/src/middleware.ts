import {createI18nMiddleware} from 'next-international/middleware';
import {NextResponse, type NextRequest} from 'next/server';

const LOCALES = ['fr', 'en'];
const DEFAULT_LOCALE = 'fr';

const I18nMiddleware = createI18nMiddleware({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
});

const getLocale = (request: NextRequest): string => {
  const acceptLanguage = request.headers.get('Accept-Language');
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const preferredLocale = acceptLanguage
    .split(',')
    .map(lang => lang.split(';')[0].trim().substring(0, 2))
    .find(lang => LOCALES.includes(lang));

  return preferredLocale || DEFAULT_LOCALE;
};

const middleware = (request: NextRequest) => {
  const {pathname} = request.nextUrl;
  const locale = getLocale(request);
  const pathPattern = new RegExp(`^(\/((${LOCALES.join('|')})\/).*|\/)$`);

  if (!pathPattern.test(pathname)) {
    return NextResponse.next();
  }

  // Handle root path specifically
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // Use I18nMiddleware for all other routes
  return I18nMiddleware(request);
};

const config = {
  matcher: `^(\/((${LOCALES.join('|')})\/).*|\/)$`,
};

export {middleware, config};
