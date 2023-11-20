'use client';
import { useLottie } from 'src/utils/useLottie';
import googleAnimationData from "src/components/interface/animations/google.json";

export const LoginButton: React.FC<{ onClick?: () => void; }> = (props) => {
  const { container: googleAnimationContainer } = useLottie(
    googleAnimationData,
    true
  );

  return (
    <div id="login-buttons" className="section">
      <button
        className="bg-[url('/login/background.png')] bg-center text-white font-bold py-1 px-10 rounded-lg border-[2px] border-gray-300"
        onClick={() => props.onClick?.()}
      >
        <div className="flex items-center">
          <div
            className="max-w-[50px]"
            ref={googleAnimationContainer}
          ></div>
          <div className="mr-5 text-lg">Login with Google</div>
        </div>
      </button>
    </div>
  );
};
