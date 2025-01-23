const cameraButton = document.getElementById("cameraButton");
const statusElement = document.getElementById("status");
const scannerElement = document.getElementById("scanner");
const scannedDataElement = document.getElementById("scanned-data");

let qrScanner;

cameraButton.addEventListener("click", async () => {
    try {
        // Check for camera access
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            // Request permission
            await navigator.mediaDevices.getUserMedia({ video: true });

            // Update status
            statusElement.textContent = "Camera permission granted!";
            statusElement.style.color = "green";

            // Start QR Code Scanner
            startScanner();
        } else {
            statusElement.textContent = "Camera access is not supported on this browser.";
            statusElement.style.color = "red";
        }
    } catch (error) {
        // Permission denied or error occurred
        statusElement.textContent = "Camera permission denied or an error occurred.";
        statusElement.style.color = "red";
        console.error("Camera error:", error);
    }
});

function startScanner() {
    if (!qrScanner) {
        qrScanner = new Html5Qrcode("scanner");

        qrScanner.start(
            { facingMode: "environment" }, // Use rear camera
            { fps: 10, qrbox: 250 },       // Scanner settings
            (decodedText) => {
                console.log(`QR Code scanned: ${decodedText}`);
                scannedDataElement.textContent = `Scanned Data: ${decodedText}`;
                qrScanner.stop(); // Stop scanner after scanning
            },
            (errorMessage) => {
                console.warn(`QR Code scan error: ${errorMessage}`);
            }
        ).catch((error) => {
            console.error("Scanner initialization failed:", error);
            statusElement.textContent = "Unable to start scanner.";
            statusElement.style.color = "red";
        });
    }
}
