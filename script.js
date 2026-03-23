login: async () => {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    
    if(!email || !pass) return alert("Please enter email and password");

    try {
        console.log("Attempting login...");
        const result = await signInWithEmailAndPassword(auth, email, pass);
        console.log("Login successful:", result.user.uid);
        alert("Login Successful!");
    } catch (error) {
        console.error("Full Error Object:", error);
        // সরাসরি এরর মেসেজ দেখাবে যাতে আপনি বুঝতে পারেন সমস্যা কোথায়
        alert("Firebase Error: " + error.message + " (Code: " + error.code + ")");
    }
},
