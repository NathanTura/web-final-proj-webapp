async function handleGoogleSignIn(response) {
  const idToken = response.credential; // the Google ID token
  console.log("Google ID Token:", idToken);

  try {
    const res = await fetch("https://ledgerpro-php.onrender.com/public/api/auth/login.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id_token: idToken }),
    });

    const data = await res.json();
    if (res.ok) {
      console.log("✅ Signed in:", data);
      alert(`Welcome, ${data.name}!`);
      
       window.location.href = "../../dashboard.html";
    } else {
      console.error("❌ Sign-in failed:", data.error);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}



