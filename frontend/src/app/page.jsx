'use client';

import { useState, useEffect } from 'react';
import Threads from './components/Threads';
import SplitText from "./components/SplitText";
import Link from 'next/link';


export default function Page() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  const handleAnimationComplete = () => {
  console.log('All letters have animated!');
};


  return (
    <main className="relative h-screen overflow-hidden bg-[#96b2d9]">
     
      {/* Threads background */}
      <div className="absolute inset-0 -z-0">
        <Threads amplitude={1} distance={0} enableMouseInteraction={true} color="#7f5af0" />
      </div>

      {/* Hero content */}
      <div className="relative flex flex-col items-center justify-center h-full text-center text-[#31207e] px-6">
         <div className="w-3xl bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10"> 
     
   {/* <h1 className="text-7xl font-bold mt-4">QueryFlow AI </h1>  */}
   <SplitText
  text="QueryFlow AI"
  className="text-8xl font-bold text-center"
  delay={100}
  duration={0.6}
  ease="power3.out"
  splitType="chars"
  from={{ opacity: 0, y: 40 }}
  to={{ opacity: 1, y: 0 }}
  threshold={0.1}
  rootMargin="-100px"
  textAlign="center"
  onLetterAnimationComplete={handleAnimationComplete}
/>
  
  <h2 className="text-4xl mt-6">Speak. Query. Visualize.</h2>

          {/* <p className="text-4xl font-medium"> */}
          {/* Speak. Query. Visualize. */}
          {/* </p>   */}
          <div className="mt-8 flex items-center justify-center gap-x-6">
            <Link
              href="/queryform"
              className="bg-[#7257c5] text-white px-6 py-3 rounded-lg transform transition-transform duration-300 hover:scale-105 hover:bg-[#503c8f]"
            >
              Get started
            </Link>
           
          </div>
        </div>
    
       </div> 
    </main>
  );
}
