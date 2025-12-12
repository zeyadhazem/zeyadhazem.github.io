import { Html, useProgress } from '@react-three/drei';

const Loader = () => {
  const { progress } = useProgress();
  return (
    <Html center>
      <span style={{ color: 'white' }}>{progress.toFixed(2)} % loaded</span>
    </Html>
  );
};

export default Loader;