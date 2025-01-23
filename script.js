document.getElementById('getDeviceButton').addEventListener('click', async function () {
    try {
        // Fetch available devices
        const devices = await navigator.mediaDevices.enumerateDevices();

        // Filter out video devices (cameras)
        const videoDevices = devices.filter(device => device.kind === 'videoinput');

        if (videoDevices.length === 0) {
            document.getElementById('device-info').textContent = 'No video devices found.';
            return;
        }

        // Display all video devices and their details (including deviceId)
        let deviceInfoText = 'Available Camera Devices:\n';
        videoDevices.forEach((device, index) => {
            deviceInfoText += `Device ${index + 1}: ${device.label} - deviceId: ${device.deviceId}\n`;
        });

        document.getElementById('device-info').textContent = deviceInfoText;
    } catch (error) {
        console.error('Error fetching devices:', error);
        document.getElementById('device-info').textContent = 'Error fetching devices.';
    }
});
