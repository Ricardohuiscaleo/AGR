import { lazy, Suspense } from 'react';
import LazyLoader from '../LazyLoader.jsx';

const ParticleNetworkBackground = lazy(() => 
  import('../ui/particle-network-background').then(module => ({
    default: module.ParticleNetworkBackground
  }))
);

export default function LazyParticleNetwork(props) {
  return (
    <LazyLoader fallback={<div className="w-full h-full bg-transparent" />}>
      <Suspense fallback={<div className="w-full h-full bg-transparent" />}>
        <ParticleNetworkBackground {...props} />
      </Suspense>
    </LazyLoader>
  );
}