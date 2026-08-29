import { Html, useProgress } from '@react-three/drei';

// The exact-size box is held by .model-skeleton in the DOM (see Projects.css);
// this only draws the progress readout centred over it. drei writes zIndex
// inline on the wrapper every frame (web/Html.js:132), so layering is not
// something CSS can set here.
const Loader = () => {
  const { progress } = useProgress();
  return (
    <Html center wrapperClass="model-loader">
      <span className="model-loader-text">{Math.round(progress)}%</span>
    </Html>
  );
};

export default Loader;
