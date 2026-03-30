// src/api/users.js

export async function fetchUserByEmail(email) {
  if (!email) throw new Error("Email is required");

  try {
    const res = await fetch(
      `http://localhost:5000/api/users/getByEmail/${encodeURIComponent(email)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    if (!res.ok) {
      // handle 404 or other HTTP errors
      const errData = await res.json();
      throw new Error(errData.error || "Failed to fetch user");
    }

    const data = await res.json();
    return data; // user object without password

  } catch (err) {
    console.error("fetchUserByEmail error:", err);
    throw err; // propagate error for caller to handle
  }
}