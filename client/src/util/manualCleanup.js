// Manual cleanup utility for authentication issues
// Use this when you need to completely reset the authentication state

const manualAuthCleanup = () => {
  try {
    // Clear all authentication-related data
    localStorage.removeItem("employee");
    sessionStorage.removeItem("auth_cleanup_done");

    // Clear any other potential auth-related keys
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.includes("auth") ||
          key.includes("employee") ||
          key.includes("token"))
      ) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));

    console.log("✅ Manual authentication cleanup completed");
    console.log("🔄 Please refresh the page to see changes");

    return true;
  } catch (error) {
    console.error("❌ Error during manual cleanup:", error);
    return false;
  }
};

// Make it available globally for browser console
if (typeof window !== "undefined") {
  window.manualAuthCleanup = manualAuthCleanup;
}

export default manualAuthCleanup;
