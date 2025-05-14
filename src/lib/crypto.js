// Cryptographic helper functions
import nacl from 'tweetnacl';
import bs58 from 'bs58';

/**
 * Verify a signature with the given message and public key
 * @param {string} message - The original message that was signed
 * @param {string} signature - The signature (hex or base64 format)
 * @param {string} publicKey - The public key in base58 format
 * @returns {boolean} Whether the signature is valid
 */
export function verifySignature(message, signature, publicKey) {
  try {
    // Convert message to Uint8Array
    const messageUint8 = new TextEncoder().encode(message);
    
    // Convert signature - handle both hex and base64 formats
    let signatureUint8;
    if (signature.match(/^[0-9a-fA-F]+$/)) {
      // Hex format
      signatureUint8 = new Uint8Array(
        signature.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
      );
    } else {
      // Base64 format from Phantom redirect
      signatureUint8 = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
    }
    
    // Convert public key from base58 to Uint8Array
    const publicKeyUint8 = bs58.decode(publicKey);
    
    // Verify signature
    return nacl.sign.detached.verify(
      messageUint8,
      signatureUint8,
      publicKeyUint8
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Creates a message to be signed for an unlock request
 * @param {string} lockId - The ID of the lock
 * @param {string} requestId - The ID of the request
 * @returns {string} The message to sign
 */
export function createSignMessage(lockId, requestId) {
  return `Unlock request for lock ${lockId} with request ID ${requestId}`;
}