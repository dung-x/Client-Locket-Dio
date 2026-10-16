export const getAvailableCameras = async () => {
  await navigator.mediaDevices.getUserMedia({ video: true });
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter((d) => d.kind === "videoinput");

  const frontCameras = [];
  const backCameras = [];

  let backUltraWideCamera = null;
  let backNormalCamera = null;
  let backZoomCamera = null;

  videoDevices.forEach((device) => {
    const label = device.label.toLowerCase();

    // 📱 Camera trước
    if (/mặt trước|front|user|trước|facing front/.test(label)) {
      frontCameras.push(device);
    }

    // 📷 Camera sau
    else if (/mặt sau|back|rear|environment|sau|facing back|camera2 0/.test(label)) {
      backCameras.push(device);

      // ➕ Phân loại theo đặc điểm
      if (/cực rộng|ultra|0.5x|góc rộng|camera2 2/.test(label)) {
        if (backUltraWideCamera === null || backUltraWideCamera === undefined) backUltraWideCamera = device;
      } else if (/chụp xa|tele|zoom|2x|3x|5x/.test(label)) {
        if (backZoomCamera === null || backZoomCamera === undefined) backZoomCamera = device;
      } else if (
        /camera kép|camera|bình thường|1x|rộng/.test(label) &&
        !/cực rộng|chụp xa|zoom|tele/.test(label)
      ) {
        if (backNormalCamera === null || backNormalCamera === undefined) backNormalCamera = device;
      }
    }
  });

  return {
    allCameras: videoDevices,
    frontCameras,
    backCameras,
    backUltraWideCamera,
    backNormalCamera,
    backZoomCamera,
  };
};
