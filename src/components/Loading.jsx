import { Html, useProgress } from '@react-three/drei';

/**
 * Rendered inside a <Canvas> tree, which lives in its own reconciler root,
 * so the label is passed in as a prop instead of read from the i18n context.
 */
const CanvasLoader = ({ label = 'Loading' }) => {
  const { progress } = useProgress();

  return (
    <Html
      as="div"
      center
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}>
      <span className="canvas-loader"></span>
      <p
        style={{
          fontSize: 14,
          color: '#F1F1F1',
          fontWeight: 800,
          marginTop: 40,
        }}>
        {progress !== 0 ? `${progress.toFixed(2)}%` : `${label}...`}
      </p>
    </Html>
  );
};

export default CanvasLoader;
