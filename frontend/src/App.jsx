import { useEffect, useState } from "react";

import {
  deleteImage,
  getImageUrl,
  getStatus,
  uploadImage,
} from "./api";
import ImageControls from "./components/ImageControls";
import "./styles.css";

export default function App() {
  const [displayImage, setDisplayImage] = useState(false);
  const [imageUploaded, setImageUploaded] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [statusText, setStatusText] = useState("Ready");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");

  async function refreshImageState(shouldDisplay = displayImage) {
    setIsBusy(true);
    setError("");

    try {
      const status = await getStatus();
      setImageUploaded(status.image_uploaded);

      if (!shouldDisplay) {
        setImageUrl("");
        setStatusText("Display Image is off");
        return;
      }

      if (status.image_uploaded) {
        setImageUrl(getImageUrl());
        setStatusText("Image loaded");
      } else {
        setImageUrl("");
        setStatusText("No image uploaded");
      }
    } catch (requestError) {
      setImageUrl("");
      setError("Unable to reach the backend. Check Docker services and try again.");
      setStatusText("Error");
    } finally {
      setIsBusy(false);
    }
  }

  useEffect(() => {
    refreshImageState(displayImage);
  }, [displayImage]);

  async function handleUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setIsBusy(true);
    setError("");
    setStatusText("Uploading image...");

    try {
      await uploadImage(file);
      setImageUploaded(true);
      setStatusText("Image uploaded");

      if (displayImage) {
        setImageUrl(getImageUrl());
      }
    } catch (requestError) {
      setError("Upload failed. Please choose a valid image and try again.");
      setStatusText("Error");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDelete() {
    setIsBusy(true);
    setError("");
    setStatusText("Deleting image...");

    try {
      await deleteImage();
      setImageUploaded(false);
      setImageUrl("");
      setStatusText(displayImage ? "No image uploaded" : "Image deleted");
    } catch (requestError) {
      setError("Delete failed. Please try again.");
      setStatusText("Error");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="workspace" aria-labelledby="app-title">
        <div className="header">
          <div>
            <p className="eyebrow">AWS Learning App - CI/CD Test</p>
            <h1 id="app-title">Single Image Manager CI/CD TEST</h1>
          </div>
          <span className={imageUploaded ? "badge badge-ok" : "badge"}>
            {imageUploaded ? "Image stored" : "Empty"}
          </span>
        </div>

        <ImageControls
          displayImage={displayImage}
          isBusy={isBusy}
          onDelete={handleDelete}
          onDisplayChange={setDisplayImage}
          onUpload={handleUpload}
        />

        <div className="status-area" role="status" aria-live="polite">
          <strong>Status:</strong> {isBusy ? "Loading..." : statusText}
          {error ? <p className="error">{error}</p> : null}
        </div>

        <div className="preview-area">
          {isBusy ? <div className="placeholder">Loading...</div> : null}
          {!isBusy && displayImage && imageUrl ? (
            <img src={imageUrl} alt="Uploaded preview" />
          ) : null}
          {!isBusy && displayImage && !imageUrl ? (
            <div className="placeholder">No image uploaded</div>
          ) : null}
          {!isBusy && !displayImage ? (
            <div className="placeholder">Display Image is off</div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
