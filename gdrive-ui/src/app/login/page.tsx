'use client';

import { useZkLoginSetup } from 'src/store/zklogin';
import { LoginButton } from './LoginButton';

const Page = () => {
  const zkLoginStore = useZkLoginSetup();

  return (
    <div>
      <p className='text-center text-lg mb-4'>
        Welcome to Sion
      </p>

      <div className="grid place-items-center mb-4">
        <LoginButton onClick={() => zkLoginStore.beginZkLogin('Google')} />
      </div>

      <pre>{JSON.stringify(zkLoginStore, null, 2)}</pre>
    </div>
  )
}

export default Page;
