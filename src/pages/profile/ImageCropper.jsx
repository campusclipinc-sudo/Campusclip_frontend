import React, { useEffect, useRef, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import "../../scss/image-cropper.scss";

/**
 * ImageCropper Component
 * Two-mode Instagram-like image cropper
 *
 * Modes:
 * - FIT_TO_SCREEN: Entire image visible, scaled down to fit viewport, black background
 * - ORIGINAL: Image at original resolution, pan/drag to reposition
 */

export const CROP_MODES = {
  FIT_TO_SCREEN: "fit",
  ORIGINAL: "original",
};

const ImageCropper = ({
  show,
  src,
  onCancel,
  onSave,
  circular = false,
  title = "Adjust Image",
  exportSize = 320,
  mode = CROP_MODES.FIT_TO_SCREEN,
  onModeChange,
}) => {
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const [currentMode, setCurrentMode] = useState(mode);
  const [zoom, setZoom] = useState(1);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [fitScale, setFitScale] = useState(1);

  useEffect(() => {
    if (!show) {
      resetState();
    }
  }, [show]);

  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  useEffect(() => {
    if (!containerRef.current || !imgRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (imgRef.current) {
        calculateFitScale(imgRef.current.naturalWidth, imgRef.current.naturalHeight);
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const resetState = () => {
    setZoom(1);
    setDrag({ x: 0, y: 0 });
    setFitScale(1);
  };

  const onImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    setNaturalSize({ width: naturalWidth, height: naturalHeight });
    calculateFitScale(naturalWidth, naturalHeight);
  };

  const calculateFitScale = (imageWidth, imageHeight) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const scaleX = containerWidth / imageWidth;
    const scaleY = containerHeight / imageHeight;
    const scale = Math.min(scaleX, scaleY, 1); // Never scale up in fit mode

    setFitScale(scale);
  };

  const getDisplayScale = () => {
    if (currentMode === CROP_MODES.FIT_TO_SCREEN) {
      return fitScale * zoom;
    }
    return zoom;
  };

  const getImageTransform = () => {
    const scale = getDisplayScale();
    return `translate(calc(-50% + ${drag.x}px), calc(-50% + ${drag.y}px)) scale(${scale})`;
  };

  const onMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setStartPos({ x: e.clientX - drag.x, y: e.clientY - drag.y });
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    setDrag({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.05 : -0.05;

    if (currentMode === CROP_MODES.FIT_TO_SCREEN) {
      // In fit mode, zoom from fitScale baseline up to 3x
      setZoom((z) => Math.min(3, Math.max(1, z + delta)));
    } else {
      // In original mode, zoom from 1x to 5x
      setZoom((z) => Math.min(5, Math.max(1, z + delta)));
    }
  };

  const zoomIn = () => {
    const maxZoom = currentMode === CROP_MODES.FIT_TO_SCREEN ? 3 : 5;
    setZoom((z) => Math.min(maxZoom, z + 0.1));
  };

  const zoomOut = () => {
    setZoom((z) => Math.max(1, z - 0.1));
  };

  const fitToScreen = () => {
    setZoom(1);
    setDrag({ x: 0, y: 0 });
  };

  const toggleMode = () => {
    const newMode =
      currentMode === CROP_MODES.FIT_TO_SCREEN
        ? CROP_MODES.ORIGINAL
        : CROP_MODES.FIT_TO_SCREEN;
    setCurrentMode(newMode);
    resetState();
    onModeChange?.(newMode);
  };

  const onSaveClick = () => {
    const size = exportSize;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = size;
    canvas.height = size;

    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = "#000000"; // Black background
    ctx.fillRect(0, 0, size, size);
    ctx.save();

    if (circular) {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
    }

    const viewportWidth = container.clientWidth;
    const viewportHeight = container.clientHeight;
    const naturalRatio = img.naturalWidth / img.naturalHeight;

    // Calculate base dimensions when image fits in square canvas at zoom=1
    // Maintains aspect ratio without stretching
    let baseWidth, baseHeight;
    if (naturalRatio >= 1) {
      // Landscape or square: fit to width
      baseWidth = size;
      baseHeight = size / naturalRatio;
    } else {
      // Portrait: fit to height
      baseHeight = size;
      baseWidth = size * naturalRatio;
    }

    // For canvas export, use user's zoom level only (not viewport fitScale)
    // In FIT_TO_SCREEN: only apply user zoom
    // In ORIGINAL: apply zoom directly
    const scale = zoom;
    const drawWidth = baseWidth * scale;
    const drawHeight = baseHeight * scale;

    // Convert viewport drag offset to canvas space
    const dragScaleX = drawWidth / viewportWidth;
    const dragScaleY = drawHeight / viewportHeight;

    const centerX = size / 2 + drag.x * dragScaleX;
    const centerY = size / 2 + drag.y * dragScaleY;
    const dx = centerX - drawWidth / 2;
    const dy = centerY - drawHeight / 2;

    ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
    ctx.restore();

    const dataUrl = canvas.toDataURL("image/png");
    onSave?.(dataUrl);
  };

  const isFitMode = currentMode === CROP_MODES.FIT_TO_SCREEN;
  const displayScale = getDisplayScale();

  return (
    <Modal
      show={show}
      onHide={onCancel}
      centered
      size="md"
      backdrop
      backdropClassName="cc-dark-backdrop"
      className="image-cropper-modal"
      aria-labelledby="image-cropper-title"
    >
      <Modal.Header closeButton>
        <Modal.Title id="image-cropper-title"></Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h2>{title}</h2>
        <p>
          {isFitMode
            ? "Entire image visible. Drag to reposition, zoom to adjust."
            : "Image at original resolution. Drag to pan around."}
        </p>

        <div
          ref={containerRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onWheel={handleWheel}
          className={`image-cropper-viewport ${isFitMode ? "fit-mode" : "original-mode"}`}
          style={!circular ? { borderRadius: "8px" } : undefined}
        >
          {src ? (
            <>
              <img
                ref={imgRef}
                src={src}
                alt="to-crop"
                onLoad={onImageLoad}
                draggable={false}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "auto",
                  height: "auto",
                  transform: getImageTransform(),
                  transformOrigin: "center center",
                  maxWidth: "none",
                  maxHeight: "none",
                  willChange: "transform",
                  pointerEvents: "none",
                }}
              />

              {!circular && isFitMode && (
                <div className="grid-overlay">
                  <svg className="grid-lines" viewBox="0 0 100 100">
                    <line x1="33.33" y1="0" x2="33.33" y2="100" />
                    <line x1="66.66" y1="0" x2="66.66" y2="100" />
                    <line x1="0" y1="33.33" x2="100" y2="33.33" />
                    <line x1="0" y1="66.66" x2="100" y2="66.66" />
                  </svg>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-muted py-5">No image selected</div>
          )}
        </div>

        <div className="image-cropper-controls d-flex align-items-center gap-3">
          <button
            type="button"
            className="zoom-btn zoom-minus-btn"
            onClick={zoomOut}
            title="Zoom out"
            aria-label="Zoom out"
          >
            −
          </button>

          <Slider
            min={1}
            max={isFitMode ? 3 : 5}
            step={0.01}
            value={zoom}
            onChange={setZoom}
            className="flex-grow-1 image-cropper-slider"
          />

          <button
            type="button"
            className="zoom-btn zoom-plus-btn"
            onClick={zoomIn}
            title="Zoom in"
            aria-label="Zoom in"
          >
            +
          </button>
        </div>

        <div className="d-flex justify-content-end save-photo-btn">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onSaveClick}>
            Save Picture
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ImageCropper;
