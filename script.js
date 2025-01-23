const cameraButton = document.getElementById("cameraButton");
const statusElement = document.getElementById("status");
const videoElement = document.getElementById("camera-stream");
const scannedDataElement = document.getElementById("scanned-data");
const cameraSelect = document.getElementById("cameraSelect");

let currentStream = null;

cameraButton.addEventListener("click", async () => {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === "videoinput");

        if (videoDevices.length > 0) {
            // Populate camera options in dropdown
            cameraSelect.innerHTML = videoDevices
                .map((device, index) => `<option value="${device.deviceId}">${device.label || `Camera ${index + 1}`}</option>`)
                .join("");
            cameraSelect.style.display = "block";

            // Automatically start with the first camera
            startCamera(videoDevices[0].deviceId);
        } else {
            statusElement.textContent = "No camera found.";
            statusElement.style.color = "red";
        }
    } catch (error) {
        statusElement.textContent = "Error accessing cameras.";
        statusElement.style.color = "red";
        console.error("Camera error:", error);
    }
});

cameraSelect.addEventListener("change", () => {
    const selectedDeviceId = cameraSelect.value;
    startCamera(selectedDeviceId);
});

async function startCamera(deviceId) {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: deviceId }, facingMode: "environment" }
        });

        // Attach stream to video element
        videoElement.srcObject = stream;
        videoElement.style.display = "block";

        currentStream = stream;
        statusElement.textContent = "Camera is ready!";
        statusElement.style.color = "green";

        // Start QR Code Scanner
        startScanner();
    } catch (error) {
        statusElement.textContent = "Unable to access the selected camera.";
        statusElement.style.color = "red";
        console.error("Camera error:", error);
    }
}

function startScanner() {
    const qrScanner = new Html5Qrcode("scanner-container");
    qrScanner.start(
        { facingMode: "environment" }, 
        { fps: 10, qrbox: 250 }, 
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
