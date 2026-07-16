export function VoiceWave({ active, bars = 5 }: { active: boolean; bars?: number }) {
  return (
    <div className="flex items-end gap-1 h-8">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-full bg-lava-600 ${active ? 'animate-wave' : 'h-1 opacity-40'}`}
          style={{
            height: active ? `${20 + (i % 3) * 8}px` : '4px',
            animationDelay: `${i * 0.12}s`,
            animationDuration: `${0.8 + (i % 2) * 0.3}s`,
          }}
        />
      ))}
    </div>
  );
}
