import QRCode from 'qrcode';

/**
 * Generates QR Code Data URL (Base64 PNG) containing verification URL / payload
 */
export const generateQRCodeDataUrl = async (docId, extraData = {}) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  // Include both the direct verification URL and essential compact verify payload
  const verifyUrl = `${frontendUrl}/?verify=${encodeURIComponent(docId)}`;

  const qrPayload = JSON.stringify({
    verifyUrl,
    docId,
    hash: extraData.hash ? extraData.hash.substring(0, 16) : undefined,
    issued: extraData.issueDate
  });

  try {
    // Generate high resolution QR code data URL
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      width: 400,
      color: {
        dark: '#0f172a', // slate-900
        light: '#ffffff'
      }
    });

    return {
      qrDataUrl,
      verifyUrl,
      rawPayload: qrPayload
    };
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};
