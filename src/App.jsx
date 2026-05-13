import { Piano } from './components/Piano';
import { Smartphone } from 'lucide-react';

function App() {
  return (
    <div className="bg-zinc-950 font-sans text-white min-h-screen flex flex-col overflow-hidden">
      {/* Portrait Mobile Overlay */}
      <div className="fixed inset-0 z-50 hidden md:hidden portrait:flex bg-zinc-950 flex-col items-center justify-center p-8 text-center">
        <div className="relative mb-8 text-zinc-500">
          <Smartphone className="w-16 h-16 animate-bounce" />
          <div className="absolute inset-0 bg-sky-500/20 blur-xl rounded-full" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3 tracking-wide">Rotate Device</h2>
        <p className="text-zinc-400 max-w-xs leading-relaxed text-sm">
          Please rotate your phone to landscape mode for the best virtual piano experience.
        </p>
      </div>

      {/* Main App Content */}
      <div className="flex-1 portrait:hidden md:portrait:block w-full flex items-center justify-center">
        <div className="w-full flex justify-center mobile-scale-container">
          <Piano />
        </div>
      </div>
    </div>
  );
}

export default App;
