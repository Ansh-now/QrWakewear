const cameraButton = document.getElementById("cameraButton");
const statusElement = document.getElementById("status");
const videoElement = document.getElementById("camera-stream");
const scannedDataElement = document.getElementById("scanned-data");

cameraButton.addEventListener("click", async () => {
    try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            // Get available media devices (cameras)
            const devices = await navigator.mediaDevices.enumerateDevices();

            // Filter video devices (cameras)
            const videoDevices = devices.filter(device => device.kind === 'videoinput');

            if (videoDevices.length === 0) {
                statusElement.textContent = "No video devices found.";
                statusElement.style.color = "red";
                return;
            }

            // Try to find the rear camera by filtering the video devices
            const rearCamera = videoDevices.find(device => {
                // Attempt to match facingMode "environment" based on device label or other properties
                return device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('rear');
            });

            if (!rearCamera) {
                statusElement.textContent = "Rear camera not found.";
                statusElement.style.color = "red";
                return;
            }

            const deviceId = rearCamera.deviceId; // Store the deviceId of the rear camera

            // Request camera stream using the selected deviceId
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: { exact: deviceId } } // Use the exact deviceId
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
