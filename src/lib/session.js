import crypto from 'crypto';

const SESSION_COOKIE_NAME = 'originiv_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'originiv-streetwear-secret-key-12345';

// Encrypt and sign a session payload
export function encryptSession(payload) {
  const data = JSON.stringify({
    ...payload,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  });
  
  // Encrypt
  const cipher = crypto.createCipheriv('aes-256-cbc', 
    crypto.scryptSync(SESSION_SECRET, 'salt', 32), 
    Buffer.alloc(16, 0)
  );
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return encrypted;
}

// Decrypt and verify session
export function decryptSession(token) {
  if (!token) return null;
  try {
    const decipher = crypto.createDecipheriv('aes-256-cbc', 
      crypto.scryptSync(SESSION_SECRET, 'salt', 32), 
      Buffer.alloc(16, 0)
    );
    let decrypted = decipher.update(token, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    const payload = JSON.parse(decrypted);
    if (payload.expiresAt < Date.now()) {
      return null; // Expired
    }
    return payload;
  } catch (error) {
    console.error('Session decryption failed:', error);
    return null;
  }
}

// Get session from cookies helper
export function getSession(cookies) {
  const cookieToken = cookies.get(SESSION_COOKIE_NAME)?.value;
  return decryptSession(cookieToken);
}

// Set session cookie helper
export function setSessionCookie(response, payload) {
  const encrypted = encryptSession(payload);
  response.cookies.set(SESSION_COOKIE_NAME, encrypted, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
  return response;
}

// Clear session cookie
export function clearSessionCookie(response) {
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
  return response;
}
