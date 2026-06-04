export default function ImageControls({
  displayImage,
  isBusy,
  onDisplayChange,
  onDelete,
  onUpload,
}) {
  return (
    <div className="controls" aria-label="Image controls">
      <label className="file-button">
        <input
          type="file"
          accept="image/*"
          disabled={isBusy}
          onChange={onUpload}
        />
        Upload Image
      </label>

      <fieldset className="display-switch" disabled={isBusy}>
        <legend>Display Image</legend>
        <label>
          <input
            type="radio"
            name="display-image"
            checked={displayImage}
            onChange={() => onDisplayChange(true)}
          />
          On
        </label>
        <label>
          <input
            type="radio"
            name="display-image"
            checked={!displayImage}
            onChange={() => onDisplayChange(false)}
          />
          Off
        </label>
      </fieldset>

      <button type="button" disabled={isBusy} onClick={onDelete}>
        Delete Image
      </button>
    </div>
  );
}
