/**
 * useCamera
 *
 * Manages webcam access, live preview, mirror toggle,
 * device enumeration, camera switching, and photo capture.
 *
 * Returned API:
 *   videoRef        {RefObject<HTMLVideoElement>}
 *   isCamReady      {boolean}
 *   error           {string|null}
 *   isMirrored      {boolean}            default true
 *   toggleMirror    {() => void}
 *   devices         {MediaDeviceInfo[]}  video input devices (populated after permission)
 *   activeDeviceId  {string|null}        deviceId of the active camera
 *   startCamera     {(deviceId?) => Promise<void>}
 *   stopCamera      {() => void}
 *   switchCamera    {(deviceId) => Promise<void>}
 *   capturePhoto    {() => {dataUrl, blob, file} | null}
 */
import { useCallback, useRef, useState } from "react";

export default function useCamera() {
  const videoRef  = useRef(null);
  const streamRef = useRef(null);

  // Use refs for values read inside capturePhoto so the closure is never stale.
  const isCamReadyRef  = useRef(false);
  const isMirroredRef  = useRef(true);

  const [isCamReady,     setIsCamReady]     = useState(false);
  const [error,          setError]          = useState(null);
  const [isMirrored,     setIsMirrored]     = useState(true);
  const [devices,        setDevices]        = useState([]);
  const [activeDeviceId, setActiveDeviceId] = useState(null);

  /* ── enumerateDevices ─────────────────────────────────────────
     Must be called after getUserMedia resolves — only then does
     the browser expose device labels.
  ─────────────────────────────────────────────────────────────── */
  const enumerateDevices = useCallback(async () => {
    try {
      const all = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = all.filter((d) => d.kind === "videoinput");
      setDevices(videoInputs);
    } catch (err) {
      console.warn("[useCamera] enumerateDevices failed:", err);
    }
  }, []);

  /* ── startCamera ──────────────────────────────────────────────
     Accepts an optional deviceId. Falls back to facingMode:"user"
     when no deviceId is provided.
  ─────────────────────────────────────────────────────────────── */
  const startCamera = useCallback(async (deviceId) => {
    try {
      setError(null);
      setIsCamReady(false);
      isCamReadyRef.current = false;

      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      const videoConstraints = deviceId
        ? { deviceId: { exact: deviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
        : { facingMode: "user",            width: { ideal: 1920 }, height: { ideal: 1080 } };

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false,
      });

      streamRef.current = stream;

      // Track which device is active
      const track = stream.getVideoTracks()[0];
      const settings = track?.getSettings?.() ?? {};
      setActiveDeviceId(settings.deviceId ?? deviceId ?? null);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      isCamReadyRef.current = true;
      setIsCamReady(true);

      // Enumerate after permission is granted so labels are available
      await enumerateDevices();
    } catch (err) {
      console.error("[useCamera] startCamera failed:", err);
      isCamReadyRef.current = false;
      setIsCamReady(false);
      setError("Unable to access camera. Please check your camera settings and permissions.");
    }
  }, [enumerateDevices]);

  /* ── stopCamera ───────────────────────────────────────────────── */
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    isCamReadyRef.current = false;
    setIsCamReady(false);
  }, []);

  /* ── switchCamera ─────────────────────────────────────────────── */
  const switchCamera = useCallback(async (deviceId) => {
    await startCamera(deviceId);
  }, [startCamera]);

  /* ── toggleMirror ─────────────────────────────────────────────── */
  const toggleMirror = useCallback(() => {
    setIsMirrored((prev) => {
      isMirroredRef.current = !prev;
      return !prev;
    });
  }, []);

  /* ── capturePhoto ─────────────────────────────────────────────── */
  /**
   * Snapshots the current video frame.
   * Reads isMirrored and isCamReady from refs so the closure is always
   * up-to-date regardless of when React last re-rendered.
   */
  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    if (!video || !isCamReadyRef.current) return null;

    const w = video.videoWidth  || 1280;
    const h = video.videoHeight || 720;

    const canvas = document.createElement("canvas");
    canvas.width  = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");

    if (isMirroredRef.current) {
      // Flip horizontally so the captured image matches the mirrored preview
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, w, h);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);

    // data URL → Blob → File for upload
    const byteStr = atob(dataUrl.split(",")[1]);
    const ab      = new ArrayBuffer(byteStr.length);
    const ia      = new Uint8Array(ab);
    for (let i = 0; i < byteStr.length; i++) ia[i] = byteStr.charCodeAt(i);
    const blob = new Blob([ab], { type: "image/jpeg" });
    const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });

    return { dataUrl, blob, file };
  }, []); // no deps — reads everything from refs

  return {
    videoRef,
    isCamReady,
    error,
    isMirrored,
    toggleMirror,
    devices,
    activeDeviceId,
    startCamera,
    stopCamera,
    switchCamera,
    capturePhoto,
  };
}
