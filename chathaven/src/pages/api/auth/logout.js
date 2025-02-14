const cookie = require("cookie");

export default function handler(req, res) {
  res.setHeader("Set-Cookie", cookie.serialize("authToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    path: "/",
    expires: new Date(0), // Expire the cookie immediately
  }));

  res.status(200).json({ message: "Logged out successfully" });
}
