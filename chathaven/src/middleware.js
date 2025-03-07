import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req) {
  const token = req.cookies.get("authToken")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));  // Redirect to login if no token
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch (error) {
    console.log(error);
    return NextResponse.redirect(new URL("/login", req.url));  // Redirect if the token is invalid
  }
}

// Protect everything except `/login`, `/register`, and API routes
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|login|register|api/auth).*)'],  
};
