/**
 * CameraPage
 *
 * Camera-specific flow, mirroring the structure of UploadPage.
 * Three steps:
 *   1. Format  — pick strip format (FormatPicker)
 *   2. Capture — live camera feed with countdown + capture loop
 *   3. Filter  — pick a filter, then generate the strip
 *
 * Reuses: StepPanel, StepHeader, BackLink, PrimaryButton, useStepFlow,
 *         FormatPicker, FilterPicker, LiveStripPreview, useCamera.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/navbar";
import FormatPicker from "../components/common/FormatPicker";
import FilterPicker, { FILTERS } from "../components/common/FilterPicker";
import {
  StepPanel,
  StepHeader,
  BackLink,
  PrimaryButton,
  useStepFlow,
} from "../components/common/StepFlow";
import LiveStripPreview from "../components/common/LiveStripPreview";
import useCamera from "../hooks/useCamera";
import { uploadPhotoStrip } from "../services/upload.service";

/* ─────────────────────────────────────────────────────────────────
   Countdown overlay
───────────────────────────────────────────────────────────────── */
function CountdownOverlay({ count }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      aria-live="assertive"
    >
      <span
        className="font-main font-bold text-white select-none"
        style={{
          fontSize: "clamp(5rem, 15vw, 10rem)",
          lineHeight: 1,
          textShadow: "0 4px 24px rgba(0,0,0,0.6)",
          animation: "countdown-pop 0.35s cubic-bezier(0.34,1.56,0.64,1) both",
        }}
      >
        {count}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Flash overlay — white flash on capture
───────────────────────────────────────────────────────────────── */
function FlashOverlay({ visible }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundColor: "white",
        opacity: visible ? 0.85 : 0,
        transition: visible ? "opacity 50ms ease" : "opacity 350ms ease",
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────
   MirrorIcon
───────────────────────────────────────────────────────────────── */
function MirrorIcon({ mirrored }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: 18, height: 18 }}
      aria-hidden="true"
    >
      {/* Centre divider */}
      <line x1="12" y1="3" x2="12" y2="21" />
      {/* Left arrow */}
      <polyline points="6 8 3 12 6 16" />
      {/* Right arrow — filled/stroked differently when active */}
      <polyline
        points="18 8 21 12 18 16"
        stroke={mirrored ? "currentColor" : "currentColor"}
        opacity={mirrored ? 1 : 0.35}
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────
   CameraIcon (small, for selector)
───────────────────────────────────────────────────────────────── */
function SmallCameraIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: 16, height: 16 }}
      aria-hidden="true"
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────
   CameraControlsBar — mirror toggle + camera selector
   Hidden while shooting or when camera isn't ready.
───────────────────────────────────────────────────────────────── */
function CameraControlsBar({
  isCamReady,
  isShooting,
  isMirrored,
  onToggleMirror,
  devices,
  activeDeviceId,
  onSwitchCamera,
}) {
  if (!isCamReady || isShooting) return null;

  // Give devices friendly names: "Camera 1", "Camera 2", etc.,
  // falling back to whatever label the browser provides.
  const getLabel = (device, index) => {
    if (device.label) {
      // Trim overly long hardware labels to something readable
      const trimmed = device.label.replace(/\s*\(.*?\)\s*/g, "").trim();
      return trimmed || `Camera ${index + 1}`;
    }
    return `Camera ${index + 1}`;
  };

  return (
    <div
      className="flex items-center justify-center gap-3 flex-wrap"
      style={{
        opacity: 1,
        transition: "opacity 200ms ease",
      }}
    >
      {/* ── Mirror toggle ─────────────────────────────────────── */}
      <button
        onClick={onToggleMirror}
        aria-pressed={isMirrored}
        aria-label={isMirrored ? "Disable mirror" : "Enable mirror"}
        title={isMirrored ? "Mirror: on" : "Mirror: off"}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-full border
          font-main text-xs transition-all duration-200
          cursor-pointer select-none
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
          ${isMirrored
            ? "bg-primary border-primary text-white shadow-sm"
            : "bg-surface border-surface text-black/50 hover:border-primary/40 hover:text-black/70"
          }
        `}
      >
        <MirrorIcon mirrored={isMirrored} />
        <span>Mirror</span>
      </button>

      {/* ── Camera selector — only shown when multiple cameras ── */}
      {devices.length > 1 && (
        <div className="relative flex items-center">
          <span
            className="absolute left-2.5 pointer-events-none text-black/40"
            aria-hidden="true"
          >
            <SmallCameraIcon />
          </span>
          <select
            value={activeDeviceId ?? ""}
            onChange={(e) => onSwitchCamera(e.target.value)}
            aria-label="Select camera"
            className="
              appearance-none
              bg-surface border border-surface
              hover:border-primary/40
              font-main text-xs text-black/70
              pl-8 pr-6 py-1.5 rounded-full
              cursor-pointer
              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
              transition-colors duration-200
            "
            style={{ minWidth: "9rem" }}
          >
            {devices.map((device, i) => (
              <option key={device.deviceId} value={device.deviceId}>
                {getLabel(device, i)}
              </option>
            ))}
          </select>
          {/* Chevron */}
          <span
            className="absolute right-2.5 pointer-events-none text-black/40"
            aria-hidden="true"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   CameraView — live feed + captured thumbnails row
───────────────────────────────────────────────────────────────── */
function CameraView({
  videoRef,
  isCamReady,
  error,
  photos,
  requiredCount,
  countdown,
  flash,
  isShooting,
  onStart,
  onRetake,
  filter,
  isMirrored,
  onToggleMirror,
  devices,
  activeDeviceId,
  onSwitchCamera,
}) {
  const remaining = requiredCount - photos.length;
  const allCaptured = photos.length === requiredCount;

  return (
    <div className="flex flex-col items-center gap-4 w-full">

      {/* ── Viewfinder ─────────────────────────────────────────── */}
      <div
        className="relative rounded-2xl overflow-hidden bg-black shadow-xl w-full"
        style={{
          maxWidth: "min(90vw, 55vh * 4/3)",
          maxHeight: "55vh",
          aspectRatio: "4/3",
          margin: "0 auto",
        }}
      >
        {/* Mirror controlled by isMirrored prop */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          style={{ transform: isMirrored ? "scaleX(-1)" : "none", transition: "transform 200ms ease" }}
          muted
          playsInline
          autoPlay
          aria-label="Camera live preview"
        />

        {/* Not-ready placeholder */}
        {!isCamReady && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: "clamp(2rem, 5vw, 3rem)", height: "clamp(2rem, 5vw, 3rem)", opacity: 0.5 }}
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <p className="font-main text-white/50 text-sm">Starting camera…</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 px-6 text-center">
            <p className="font-main text-white/70 text-sm" role="alert">{error}</p>
          </div>
        )}

        {/* Countdown */}
        {countdown !== null && <CountdownOverlay count={countdown} />}

        {/* Flash */}
        <FlashOverlay visible={flash} />

        {/* Shot counter badge */}
        {isCamReady && !allCaptured && (
          <div className="absolute top-3 right-3 bg-black/50 rounded-full px-3 py-1">
            <span className="font-main text-white/80 text-xs">
              {photos.length} / {requiredCount}
            </span>
          </div>
        )}
      </div>

      {/* ── Controls row: mirror | capture | camera selector ── */}
      {isCamReady && !isShooting && (
        <div
          className="flex items-center justify-between w-full"
          style={{ maxWidth: "min(90vw, 55vh * 4/3)", margin: "0 auto" }}
        >
          {/* Left slot — mirror toggle normally, retake when all captured */}
          {allCaptured ? (
            <button
              onClick={onRetake}
              className="font-main text-sm text-black/35 hover:text-primary transition-colors duration-200 cursor-pointer bg-transparent border-none p-0"
            >
              ↺ retake
            </button>
          ) : (
            <button
              onClick={onToggleMirror}
              aria-pressed={isMirrored}
              aria-label={isMirrored ? "Disable mirror" : "Enable mirror"}
              title={isMirrored ? "Mirror: on" : "Mirror: off"}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full border
                font-main text-xs transition-all duration-200
                cursor-pointer select-none
                focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                ${isMirrored
                  ? "bg-primary border-primary text-white shadow-sm"
                  : "bg-surface border-surface text-black/50 hover:border-primary/40 hover:text-black/70"
                }
              `}
            >
              <MirrorIcon mirrored={isMirrored} />
              <span>Mirror</span>
            </button>
          )}

          {/* Center slot — capture or looks good */}
          <PrimaryButton onClick={onStart}>
            {allCaptured
              ? "Looks good →"
              : photos.length === 0
                ? `Start (${requiredCount} shots)`
                : `Continue (${remaining} left)`}
          </PrimaryButton>

          {/* Right slot — camera selector or spacer */}
          {devices.length > 1 ? (
            <div className="relative flex items-center">
              <span className="absolute left-2.5 pointer-events-none text-black/40" aria-hidden="true">
                <SmallCameraIcon />
              </span>
              <select
                value={activeDeviceId ?? ""}
                onChange={(e) => onSwitchCamera(e.target.value)}
                aria-label="Select camera"
                className="
                  appearance-none
                  bg-surface border border-surface
                  hover:border-primary/40
                  font-main text-xs text-black/70
                  pl-8 pr-6 py-1.5 rounded-full
                  cursor-pointer
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                  transition-colors duration-200
                "
                style={{ minWidth: "8rem" }}
              >
                {devices.map((device, i) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label
                      ? device.label.replace(/\s*\(.*?\)\s*/g, "").trim() || `Camera ${i + 1}`
                      : `Camera ${i + 1}`}
                  </option>
                ))}
              </select>
              <span className="absolute right-2.5 pointer-events-none text-black/40" aria-hidden="true">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </div>
          ) : (
            <div style={{ width: "80px" }} />
          )}
        </div>
      )}

      {/* Shooting hint */}
      {isShooting && (
        <p className="font-main italic text-black/50 text-sm">Get ready…</p>
      )}

      {/* Error retry */}
      {error && <PrimaryButton onClick={onStart}>Try again</PrimaryButton>}

      {/* ── Thumbnail row ──────────────────────────────────────── */}
      {photos.length > 0 && (
        <div className="flex gap-2 flex-wrap justify-center">
          {photos.map((photo, i) => (
            <div
              key={i}
              className="relative rounded-xl overflow-hidden shadow-md"
              style={{ width: "clamp(48px, 7vw, 72px)", aspectRatio: "4/3" }}
            >
              <img
                src={photo.previewUrl}
                alt={`Captured photo ${i + 1}`}
                className="w-full h-full object-cover"
                style={{ filter: filter?.css ?? "none" }}
              />
              <span className="absolute bottom-0.5 left-1 font-main text-white/60 text-xs select-none">
                {i + 1}
              </span>
            </div>
          ))}
          {Array.from({ length: remaining }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="rounded-xl border-2 border-dashed border-primary/25 bg-surface/40 flex items-center justify-center"
              style={{ width: "clamp(48px, 7vw, 72px)", aspectRatio: "4/3" }}
              aria-hidden="true"
            />
          ))}
        </div>
      )}

    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────────── */
export default function CameraPage() {
  const navigate = useNavigate();

  const { currentStep, displayStep, goToStep } = useStepFlow(1);
  const [format, setFormat] = useState(null);
  const [filter, setFilter] = useState(FILTERS[0]);

  // Captured photos: [{ dataUrl, blob, file, previewUrl }]
  const [photos, setPhotos] = useState([]);

  // Countdown / shooting state
  const [countdown,  setCountdown]  = useState(null);
  const [flash,      setFlash]      = useState(false);
  const [isShooting, setIsShooting] = useState(false);

  // Upload / generate state
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError,     setGenError]     = useState(null);

  const shootingRef = useRef(false);

  // Page entrance animation
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setEntered(true))
    );
    return () => cancelAnimationFrame(raf);
  }, []);

  const fade = (delay = 0) => ({
    opacity:    entered ? 1 : 0,
    transform:  entered ? "translateY(0)" : "translateY(24px)",
    transition: `opacity 500ms ease ${delay}ms, transform 500ms cubic-bezier(0.33,1,0.68,1) ${delay}ms`,
  });

  const {
    videoRef,
    isCamReady,
    error: camError,
    isMirrored,
    toggleMirror,
    devices,
    activeDeviceId,
    startCamera,
    stopCamera,
    switchCamera,
    capturePhoto,
  } = useCamera();

  const requiredCount = format?.requiredCount ?? 4;

  /* ── Start camera when entering step 2 ─────────────────────── */
  // startCamera fires on displayStep (not currentStep) because StepPanel
  // only mounts the <video> element after the 440ms transition delay.
  // Watching displayStep ensures videoRef.current is in the DOM before
  // we call startCamera and try to assign the stream to it.
  useEffect(() => {
    if (displayStep === 2 && currentStep === 2) {
      startCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayStep]);

  // Stop the camera as soon as the user leaves step 2 (no need to wait).
  useEffect(() => {
    if (currentStep !== 2) {
      stopCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  /* ── Clean up stream on unmount ─────────────────────────────── */
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Countdown + capture loop ───────────────────────────────── */
  /**
   * Fires one countdown (3-2-1), captures, triggers flash, repeats
   * until requiredCount photos are captured.
   */
  const runShootingLoop = useCallback(
    (existingPhotos) => {
      const total = requiredCount;
      shootingRef.current = true;
      setIsShooting(true);

      const captured = [...existingPhotos];

      function runOne() {
        if (!shootingRef.current) return;

        // Countdown from 3
        let tick = 3;
        setCountdown(tick);

        const interval = setInterval(() => {
          tick -= 1;
          if (tick > 0) {
            setCountdown(tick);
          } else {
            clearInterval(interval);
            setCountdown(null);

            // Capture
            const photo = capturePhoto();
            if (photo) {
              // Flash
              setFlash(true);
              setTimeout(() => setFlash(false), 400);

              const entry = {
                ...photo,
                previewUrl: photo.dataUrl,
              };
              captured.push(entry);
              setPhotos([...captured]);
            }

            // Continue or finish
            if (captured.length < total && shootingRef.current) {
              setTimeout(runOne, 900);
            } else {
              shootingRef.current = false;
              setIsShooting(false);
            }
          }
        }, 1000);
      }

      // Small initial delay so the user can get in frame
      setTimeout(runOne, 600);
    },
    [requiredCount, capturePhoto]
  );

  const handleStartShooting = useCallback(() => {
    if (photos.length >= requiredCount) {
      // "Looks good" pressed — advance to filter step
      goToStep(3);
      return;
    }
    runShootingLoop(photos);
  }, [photos, requiredCount, runShootingLoop, goToStep]);

  const handleRetake = useCallback(() => {
    shootingRef.current = false;
    setIsShooting(false);
    setCountdown(null);
    setPhotos([]);
  }, []);

  /* ── Format change ─────────────────────────────────────────── */
  const handleFormatChange = (newFormat) => {
    setPhotos([]);
    setFormat(newFormat);
  };

  /* ── Back to capture from filter ───────────────────────────── */
  const handleBackToCapture = () => {
    setPhotos([]);
    goToStep(2);
  };

  /* ── Generate strip ────────────────────────────────────────── */
  const handleGenerate = async () => {
    if (!format || photos.length < requiredCount) return;
    setIsGenerating(true);
    setGenError(null);
    try {
      // uploadPhotoStrip expects photos with a .file property
      const response = await uploadPhotoStrip(photos, filter.id, format.id);
      if (response.success) {
        navigate(`/share/${response.data.shareID}`, {
          state: {
            url: response.data.imageUrl,
            filename: response.data.filename,
            from: "camera",
          },
        });
      } else {
        setGenError("Something went wrong generating the strip. Please try again.");
      }
    } catch (err) {
      console.error("[CameraPage] generate failed:", err);
      setGenError("Connection error. Please check your network and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="h-svh bg-theme flex flex-col overflow-hidden">

      {/* Countdown pop keyframe — injected once */}
      <style>{`
        @keyframes countdown-pop {
          0%   { opacity: 0; transform: scale(1.6); }
          60%  { opacity: 1; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <header className="shrink-0 z-50 w-full px-4 pt-4 pb-2 sm:px-3 sm:pt-3">
        <div style={fade(0)}>
          <NavBar backLabel="← options" onBack={() => navigate("/start")} />
        </div>
      </header>

      <main className="flex-1 flex justify-center px-4 py-3 sm:px-3 overflow-y-auto">
        <div
          className="w-full flex items-center gap-6 lg:flex-row flex-col"
          style={{ justifyContent: "center", ...fade(160) }}
        >

          {/* ── Steps ─────────────────────────────────────────── */}
          <div
            style={{
              flex:      currentStep >= 2 ? "1" : "0 0 auto",
              width:     currentStep >= 2 ? "auto" : "100%",
              margin:    currentStep >= 2 ? "0" : "0 auto",
              transition: "flex 1000ms ease, margin 500ms ease-in-out",
            }}
          >

            {/* Step 1 — Format */}
            <StepPanel visible={displayStep === 1 && currentStep === 1}>
              <StepHeader
                step={1}
                label="Choose a format"
                hint="How many photos in your strip?"
              />
              <FormatPicker
                selected={format?.id ?? null}
                onChange={handleFormatChange}
              />
              <div className="mt-6">
                <PrimaryButton disabled={!format} onClick={() => goToStep(2)}>
                  Confirm Selection
                </PrimaryButton>
              </div>
            </StepPanel>

            {/* Step 2 — Capture */}
            <StepPanel visible={displayStep === 2 && currentStep === 2}>
              <StepHeader
                step={2}
                label={`Take ${requiredCount} photo${requiredCount !== 1 ? "s" : ""}`}
                hint="Smile! The countdown will start automatically."
              />
              <CameraView
                videoRef={videoRef}
                isCamReady={isCamReady}
                error={camError}
                photos={photos}
                requiredCount={requiredCount}
                countdown={countdown}
                flash={flash}
                isShooting={isShooting}
                onStart={handleStartShooting}
                onRetake={handleRetake}
                filter={filter}
                isMirrored={isMirrored}
                onToggleMirror={toggleMirror}
                devices={devices}
                activeDeviceId={activeDeviceId}
                onSwitchCamera={switchCamera}
              />
              <BackLink
                onClick={() => {
                  handleRetake();
                  goToStep(1);
                }}
                label="change format"
              />
            </StepPanel>

            {/* Step 3 — Filter */}
            <StepPanel visible={displayStep === 3 && currentStep === 3}>
              <StepHeader
                step={3}
                label="Pick a filter"
                hint="Applied to all photos on your strip."
              />
              <FilterPicker
                selected={filter.id}
                onChange={setFilter}
                previewSrc={photos[0]?.previewUrl}
              />
              {genError && (
                <p className="font-main text-sm text-secondary text-center" role="alert">
                  {genError}
                </p>
              )}
              <PrimaryButton
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? "Generating…" : "Generate Strip →"}
              </PrimaryButton>
              <BackLink
                onClick={handleBackToCapture}
                label="retake photos"
              />
            </StepPanel>

          </div>

          {/* ── Right: Live strip preview ──────────────────────── */}
          <div
            style={{
              flexShrink: 0,
              width:      currentStep >= 2 ? "auto" : 0,
              overflow:   "hidden",
              transition: "width 500ms ease",
            }}
          >
            <LiveStripPreview
              photos={photos}
              requiredCount={requiredCount}
              filter={filter}
              format={format}
              visible={currentStep >= 2}
            />
          </div>

        </div>
      </main>

    </div>
  );
}
