import Spline from '@splinetool/react-spline/next';

export default function ThreeD() {
  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-auto">
        <Spline
          scene="https://prod.spline.design/XcmGIlriYIUFXwxT/scene.splinecode"
          className="w-full h-full"
        />
      </div>
  );
}
