import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

function QRScanner({ onScanSuccess, onClose }) {
    const [scanError, setScanError] = useState('');

    useEffect(() => {
        const scanner = new Html5QrcodeScanner('reader', {
            fps: 10,
            qrbox: { width: 250, height: 250 },
        });

        scanner.render(
            (decodedText) => {
                scanner.clear().catch((error) => console.error(error));
                onScanSuccess(decodedText);
            },
            (error) => {
                // Ignore routine scanning frame errors
            }
        );

        return () => {
            scanner.clear().catch((error) => console.error('Failed to clear scanner', error));
        };
    }, [onScanSuccess]);

    return (
        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', maxWidth: '400px', margin: '20px auto', textAlign: 'center', border: '1px solid #ccc' }}>
            <h3>Scan Attendance QR Code</h3>
            <div id="reader" style={{ width: '100%' }}></div>
            <button
                onClick={onClose}
                style={{ marginTop: '15px', padding: '8px 15px', background: '#c00000', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
                Close Scanner
            </button>
            {scanError && <p style={{ color: 'red' }}>{scanError}</p>}
        </div>
    );
}

export default QRScanner;