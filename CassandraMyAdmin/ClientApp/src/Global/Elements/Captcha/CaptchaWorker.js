async function sha256Async(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);

    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

    return hashHex;
}

export async function SolveCaptcha(salt, difficulty) {
    let randomString = Math.random().toString(36).slice(2);
    let hash = await sha256Async(salt + randomString);
    while (hash.slice(0, difficulty) !== '0'.repeat(difficulty)) {
        randomString = Math.random().toString(36).slice(2);
        hash = await sha256Async(salt + randomString);
    }
    return hash + "|" + randomString + "|" + salt;
}