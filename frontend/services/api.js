const BASE_URL = "https://behavior-disorder-system-production.up.railway.app";

/**
 * Send data to behavioral prediction model
 * @param {Object} data - input features or symptoms
 */
export async function predictBehavior(data) {
  try {
    const response = await fetch(`${BASE_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Prediction API Error:", error);
    return {
      success: false,
      error: "Failed to connect to backend API",
    };
  }
}

/**
 * Health check (optional)
 */
export async function checkAPI() {
  try {
    const response = await fetch(`${BASE_URL}/`);
    return await response.json();
  } catch (error) {
    console.error("API Health Check Failed:", error);
    return {
      success: false,
      error: "Backend not reachable",
    };
  }
}