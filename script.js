// Camera Permission Functionality
document.getElementById("cameraButton").addEventListener("click", async () => {
    const status = document.getElementById("status");

    try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            // Request camera access
            await navigator.mediaDevices.getUserMedia({ video: true });
            status.textContent = "Camera permission granted!";
            status.style.color = "green";
            startScanner(); // Start the QR Scanner after permission is granted
        } else {
            status.textContent = "Camera access is not supported in this browser.";
            status.style.color = "red";
        }
    } catch (error) {
        status.textContent = "Camera permission denied or an error occurred.";
        status.style.color = "red";
        console.error("Error:", error);
    }
});

// QR Code Scanner Functionality
function onScanSuccess(decodedText, decodedResult) {
    console.log(`QR Code scanned: ${decodedText}`);
    document.getElementById('scanned-data').innerText = `Scanned Data: ${decodedText}`;
}

function onScanError(errorMessage) {
    console.warn(`QR Code scan error: ${errorMessage}`);
}

function startScanner() {
    const qrScanner = new Html5Qrcode("scanner");
    qrScanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        onScanSuccess,
        onScanError
    );
}
