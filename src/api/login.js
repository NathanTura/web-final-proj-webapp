module.exports = (req, res) => {
  res.status(200).json({ message: "Hello from API!" });
};

async function handleGoogleSignIn(response) {
  const idToken = response.credential;

  try {
    const res = await fetch('https://', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id_token: idToken })
    });

    const data = await res.json();

    if (res.ok) {
      console.log('Signed in successfully:', data);
      // You can store returned JWT or redirect user
    } else {
      console.error('Sign-in failed:', data.error);
    }
  } catch (err) {
    console.error('Request failed:', err);
  }
}
