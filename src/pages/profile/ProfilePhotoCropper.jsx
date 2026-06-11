import React, { useEffect, useRef, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearchMinus, faSearchPlus } from "@fortawesome/free-solid-svg-icons";

import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import "../../scss/profile-photo-modal.scss";

/**
 * ProfilePhotoCropper
 * - Simple zoom and drag cropper for square/circular avatar
 * - No external dependencies; uses CSS transform and canvas export
 *
 * Props:
 * - show: boolean (controls modal visibility)
 * - src: string (image data URL or URL)
 * - onCancel: () => void
 * - onSave: (dataUrl: string) => void
 */
const ProfilePhotoCropper = ({ show, src, onCancel, onSave, circular = true, title = "Adjust Profile Picture", exportSize = 320 }) => {
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!show) {
      setZoom(1);
      setDrag({ x: 0, y: 0 });
    }
  }, [show]);

  const onImageLoad = (e) => {
    setNaturalSize({
      width: e.target.naturalWidth,
      height: e.target.naturalHeight,
    });
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
    // zoom in/out with wheel
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.05 : -0.05;
    setZoom((z) => Math.min(3, Math.max(1, z + delta)));
  };

  const zoomIn = () => setZoom((z) => Math.min(3, z + 0.1));
  const zoomOut = () => setZoom((z) => Math.max(1, z - 0.1));

  const onSaveClick = () => {
    const size = exportSize;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = size;
    canvas.height = size;

    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    const viewportSize = container.clientWidth;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.save();
    if (circular) {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
    }

    const naturalRatio = img.naturalWidth / img.naturalHeight;
    let drawWidth, drawHeight;

    // Base size should cover the canvas at zoom=1
    if (naturalRatio >= 1) {
      // landscape -> fit height
      drawHeight = size * zoom;
      drawWidth = naturalRatio * drawHeight;
    } else {
      // portrait -> fit width
      drawWidth = size * zoom;
      drawHeight = (1 / naturalRatio) * drawWidth;
    }

    // The image is centered plus drag offset (scaled to export size)
    const centerX = size / 2 + (drag.x * size) / viewportSize;
    const centerY = size / 2 + (drag.y * size) / viewportSize;
    const dx = centerX - drawWidth / 2;
    const dy = centerY - drawHeight / 2;

    ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
    ctx.restore();

    const dataUrl = canvas.toDataURL("image/png");
    onSave?.(dataUrl);
  };

  return (
    <Modal
      show={show}
      onHide={onCancel}
      centered
      size="md"
      backdrop
      backdropClassName="cc-dark-backdrop"
      className="avatar-cropper-modal"
      aria-labelledby="avatar-cropper-title"
    >
      <Modal.Header closeButton>
        <Modal.Title id="avatar-cropper-title"></Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h2>{title}</h2>
        <p>Drag to reposition and use the slider to zoom.</p>

        <div
          ref={containerRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onWheel={handleWheel}
          className="avatar-cropper-viewport"
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
                  width:
                    naturalSize.width >= naturalSize.height ? "auto" : "100%",
                  height:
                    naturalSize.width >= naturalSize.height ? "100%" : "auto",
                  transform: `translate(calc(-50% + ${drag.x}px), calc(-50% + ${drag.y}px)) scale(${zoom})`,
                  transformOrigin: "center center",
                  maxWidth: "none",
                  maxHeight: "none",
                  willChange: "transform",
                }}
              />

              {!circular && (
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

        <div className="avatar-cropper-controls d-flex align-items-center">
          {/* <Button
                        variant="light"
                        onClick={zoomOut}
                        aria-label="Zoom out"
                        className="icon-btn"
                    >
                        <FontAwesomeIcon icon={faSearchMinus} />
                    </Button> */}
          {/* <input
                        type="range"
                        min={0.5}
                        max={3}
                        step={0.01}
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="flex-grow-1 avatar-cropper-slider"
                    /> */}

          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            data-filename="components/profile/ImageCropper"
            data-linenumber="137"
            data-visual-selector-id="components/profile/ImageCropper137"
            data-source-location="components/profile/ImageCropper:137:12"
            data-dynamic-content="false"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" x2="16.65" y1="21" y2="16.65"></line>
            <line x1="11" x2="11" y1="8" y2="14"></line>
            <line x1="8" x2="14" y1="11" y2="11"></line>
          </svg>

          <Slider
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(value) => setZoom(value)}
            className="flex-grow-1 avatar-cropper-slider"
          />
          {/* <Button
                        variant="light"
                        onClick={zoomIn}
                        aria-label="Zoom in"
                        className="icon-btn"
                    >
                        <FontAwesomeIcon icon={faSearchPlus} />
                    </Button> */}
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

export default ProfilePhotoCropper;
