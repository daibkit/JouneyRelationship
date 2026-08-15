import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  const coupleSession = request.cookies.get('couple_session');
  
  // Kiểm tra xem người dùng đang truy cập trang đăng nhập / đăng ký
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');

  // Nếu không có session và không phải trang Auth, đá về /login
  if (!coupleSession && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Nếu đã có session nhưng lại vào trang Auth, đá về / (trang chủ)
  if (coupleSession && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Yêu cầu Middleware chạy trên mọi route, ngoại trừ các file tĩnh và API
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
