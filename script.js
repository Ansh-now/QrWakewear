const cameraButton = document.getElementById("cameraButton");
const statusElement = document.getElementById("status");
const videoElement = document.getElementById("camera-stream");
const scannedDataElement = document.getElementById("scanned-data");

cameraButton.addEventListener("click", async () => {
    try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            // Request camera stream using the provided deviceId
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: { exact: "0d0ea2442c02a4f18b0caf8b2c505053905dedea8a431370d28ac0428e0561fc" } } // Use provided deviceId
            });

            // Attach the stream to the video element for preview
            videoElement.srcObject = stream;
            videoElement.style.display = "block";

            // Update status
            statusElement.textContent = "Camera is ready!";
            statusElement.style.color = "green";

            // Initialize QR Code Scanner
            startScanner();
        } else {
            statusElement.textContent = "Camera access is not supported on this browser.";
            statusElement.style.color = "red";
        }
    } catch (error) {
        statusElement.textContent = "Camera permission denied or an error occurred.";
        statusElement.style.color = "red";
        console.error("Camera error:", error);
    }
});

function startScanner() {
    const qrScanner = new Html5Qrcode("scanner-container");
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
