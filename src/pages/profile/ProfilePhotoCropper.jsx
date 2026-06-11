import ImageCropper, { CROP_MODES } from "./ImageCropper";

/**
 * ProfilePhotoCropper - Backward compatibility wrapper
 * Uses the new ImageCropper component with FIT_TO_SCREEN mode for profile pictures
 */
const ProfilePhotoCropper = ({
  show,
  src,
  onCancel,
  onSave,
  circular = true,
  title = "Adjust Profile Picture",
  exportSize = 320,
}) => {
  return (
    <ImageCropper
      show={show}
      src={src}
      onCancel={onCancel}
      onSave={onSave}
      circular={circular}
      title={title}
      exportSize={exportSize}
      mode={CROP_MODES.FIT_TO_SCREEN}
    />
  );
};

export default ProfilePhotoCropper;
