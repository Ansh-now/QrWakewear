function onScanSuccess(decodedText, decodedResult) {
    console.log(`QR Code scanned: ${decodedText}`);
    document.getElementById('scanned-data').innerText = `Scanned Data: ${decodedText}`;
}

function onScanError(errorMessage) {
    console.warn(`QR Code scan error: ${errorMessage}`);
}

function startScanner() {
    const qrScanner = new Html5Qrcode("scanner");
    qrScanner.start({ facingMode: "environment" }, { fps: 10, qrbox: 250 }, onScanSuccess, onScanError);
}

window.onload = startScanner;
