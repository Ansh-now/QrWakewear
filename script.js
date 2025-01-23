const cameraButton = document.getElementById("cameraButton");
const statusElement = document.getElementById("status");
const scannerElement = document.getElementById("scanner");
const scannedDataElement = document.getElementById("scanned-data");

let qrScanner = null;

cameraButton.addEventListener("click", async () => {
    try {
        // Stop any existing scanner
        if (qrScanner) {
            await qrScanner.stop();
        }

        // Get all video input devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        console.log(devices); // Log the devices to see available cameras
        const videoDevices = devices.filter(device => device.kind === "videoinput");

        if (videoDevices.length > 0) {
            console.log("Found video devices:", videoDevices); // Log available video devices
            // Automatically start scanner with the first camera (we assume the first camera is the correct one)
            startScanner(videoDevices[0].deviceId);
        } else {
            statusElement.textContent = "No camera found.";
            statusElement.style.color = "red";
            console.error("No video input devices available.");
        }
    } catch (error) {
        statusElement.textContent = "Error accessing cameras.";
        statusElement.style.color = "red";
        console.error("Camera access error:", error);
    }
});

async function startScanner(deviceId) {
    try {
        if (qrScanner) {
            await qrScanner.stop();
        }

        qrScanner = new Html5Qrcode("scanner");
        await qrScanner.start(
            { deviceId: { exact: deviceId } },
            { fps: 10, qrbox: 250 },
            (decodedText) => {
                console.log(`QR Code scanned: ${decodedText}`);
                scannedDataElement.textContent = `Scanned Data: ${decodedText}`;
            },
            (errorMessage) => {
                console.warn(`QR Code scan error: ${errorMessage}`);
            }
        );

        statusElement.textContent = "Scanner is running...";
        statusElement.style.color = "green";
    } catch (error) {
        statusElement.textContent = "Unable to start scanner.";
        statusElement.style.color = "red";
        console.error("Scanner error:", error);
    }
}
