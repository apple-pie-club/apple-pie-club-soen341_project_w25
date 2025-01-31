export function setAuthToken(token) {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
}

export function getAuthToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
}
