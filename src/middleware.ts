import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // 1. Skip next internal and static files
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/admin') ||
        pathname.includes('.') || 
        pathname === '/favicon.ico'
    ) {
        return NextResponse.next();
    }

    // 2. SAUVETAGE PINTEREST : 
    // Si l'URL commence par /fr/, on retire le /fr/ en interne (REWRITE)
    // Cela permet aux liens Pinterest existants de fonctionner sans erreur 404
    if (pathname.startsWith('/fr/') || pathname === '/fr') {
        const newPathname = pathname === '/fr' ? '/' : pathname.replace('/fr/', '/');
        const url = request.nextUrl.clone();
        url.pathname = newPathname;
        return NextResponse.rewrite(url);
    }

    // 3. Pour tout le reste, on laisse passer normalement
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
