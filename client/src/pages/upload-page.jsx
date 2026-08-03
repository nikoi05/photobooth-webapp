/**
 * UploadPage
 *
 * Upload-specific flow. All step UI primitives come from StepFlow.
 * Live preview comes from LiveStripPreview.
 * This file only owns upload-specific logic and the PhotoGrid.
 */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/navbar";
import FormatPicker, { FORMATS } from "../components/common/FormatPicker";
import FilterPicker, { FILTERS } from "../components/common/FilterPicker";
import { StepPanel, StepHeader, BackLink, PrimaryButton, useStepFlow } from "../components/common/StepFlow";
import LiveStripPreview from "../components/common/LiveStripPreview";
import { useUpload } from "../hooks/useUpload";

/* ─────────────────────────────────────────────────────────────────
   PhotoGrid — upload-specific slot grid
───────────────────────────────────────────────────────────────── */
function PhotoGrid({ photos, requiredCount, onRemove, onSlotClick, filter }) {
  const empty = Array.from({ length: requiredCount - photos.length });

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {photos.map((photo, i) => (
        <div
          key={i}
          className="relative group rounded-2xl overflow-hidden shadow-md"
          style={{ width: "clamp(80px, 12vw, 112px)", aspectRatio: "3/4" }}
        >
          <img
            src={photo.previewUrl}
            alt={`Photo ${i + 1}`}
            className="w-full h-full object-cover"
            style={{ filter: filter?.css ?? "none" }}
          />
          <span className="absolute bottom-1.5 left-2 font-main text-white/70 text-xs select-none">
            {i + 1}
          </span>
          <button
            onClick={() => onRemove(i)}
            aria-label={`Remove photo ${i + 1}`}
            className="
              absolute inset-0 flex items-center justify-center
              bg-black/0 hover:bg-black/40
              text-transparent hover:text-white
              font-main text-sm font-semibold
              transition-all duration-200 cursor-pointer
            "
          >
            Remove
          </button>
        </div>
      ))}

      {empty.map((_, i) => (
        <button
          key={`empty-${i}`}
          onClick={onSlotClick}
          aria-label="Add photo"
          className="
            rounded-2xl border-2 border-dashed border-primary/25
            bg-surface/60 hover:bg-surface hover:border-primary/60
            flex flex-col items-center justify-center gap-2
            transition-all duration-200 cursor-pointer
            focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30
          "
          style={{ width: "clamp(80px, 12vw, 112px)", aspectRatio: "3/4" }}
        >
          <span className="text-primary/40 text-4xl leading-none font-light">+</span>
          <span className="font-main text-xs text-primary/35">add photo</span>
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────────── */
export default function UploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const { currentStep, displayStep, goToStep } = useStepFlow(1);
  const [format, setFormat] = useState(null);
  const [filter, setFilter] = useState(FILTERS[0]);

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

  const requiredCount = format?.requiredCount ?? 4;
  const { photos, error, isFull, addPhotos, removePhoto, clearPhotos, Generate } =
    useUpload(requiredCount);

  const handleFormatChange = (newFormat) => {
    clearPhotos();
    setFormat(newFormat);
  };

  const handleFileInput = (e) => {
    if (e.target.files?.length) {
      addPhotos(e.target.files);
      e.target.value = "";
    }
  };

  const handleChangePhotos = () => {
    clearPhotos();
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-theme flex flex-col">

      {/* Always-mounted hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleFileInput}
      />

      <header className="sticky top-0 z-50 w-full px-8 pt-4 pb-2 md:px-6 md:pt-3 sm:px-4 sm:pt-2">
        <div style={fade(0)}>
          <NavBar />
        </div>
        <div className="mt-3 pl-1" style={fade(80)}>
          <button
            onClick={() => navigate("/start")}
            className="font-main text-sm text-black/35 hover:text-primary transition-colors duration-200 cursor-pointer bg-transparent border-none p-0"
          >
            ← back to options
          </button>
        </div>
      </header>

      <main className="flex-1 flex justify-center px-8 pt-6 pb-12 md:px-6 sm:px-4">
        <div
          className="w-full max-w-4xl flex items-start gap-10 lg:flex-row flex-col"
          style={{ justifyContent: "center", ...fade(160) }}
        >
          {/* ── Steps — centered alone on step 1, shifts left when preview appears ── */}
          <div
            style={{
              flex: currentStep >= 2 ? "1" : "0 0 auto",
              width: currentStep >= 2 ? "auto" : "100%",
              maxWidth: "36rem",
              margin: currentStep >= 2 ? "0" : "0 auto",
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
              <FormatPicker selected={format?.id ?? null} onChange={handleFormatChange} />
              <div className="mt-8">
                <PrimaryButton disabled={!format} onClick={() => goToStep(2)}>
                  Confirm Selection
                </PrimaryButton>
              </div>
            </StepPanel>

            {/* Step 2 — Upload */}
            <StepPanel visible={displayStep === 2 && currentStep === 2}>
              <StepHeader
                step={2}
                label={`Upload ${requiredCount} photo${requiredCount !== 1 ? "s" : ""}`}
                hint="Fill every slot to continue."
              />
              <PhotoGrid
                photos={photos}
                requiredCount={requiredCount}
                onRemove={removePhoto}
                onSlotClick={() => fileInputRef.current?.click()}
                filter={filter}
              />
              {error && (
                <p className="font-main text-sm text-secondary text-center mt-4" role="alert">
                  {error}
                </p>
              )}
              {!isFull && (
                <PrimaryButton onClick={() => fileInputRef.current?.click()}>
                  {photos.length === 0 ? "Select Photos" : "Add More"}
                </PrimaryButton>
              )}
              {isFull && (
                <div className="mt-6 flex items-center gap-4">
                  <PrimaryButton onClick={handleChangePhotos}>
                    Change Photos
                  </PrimaryButton>
                  <PrimaryButton onClick={() => goToStep(3)}>
                    Confirm & Continue →
                  </PrimaryButton>
                </div>
              )}
              <BackLink onClick={() => { clearPhotos(); goToStep(1); }} label="change format" />
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
              <PrimaryButton onClick={() => Generate({ filter, format })}>
                Generate Strip →
              </PrimaryButton>
              <BackLink onClick={() => goToStep(2)} label="change photos" />
            </StepPanel>

          </div>

          {/* ── Right: Live strip preview — takes no space until visible ── */}
          <div style={{
            flexShrink: 0,
            width: currentStep >= 2 ? "auto" : 0,
            overflow: "hidden",
            transition: "width 500ms ease",
          }}>
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
