import { useUiPreferences } from '../../../hooks/useUiPreferences';

const loadingDotAnimationDelays = ['0s', '0.16s', '0.32s'];

export default function AuthLoadingScreen() {
  const { preferences } = useUiPreferences();

  if (preferences.useNewUi) {
    return <V2LoadingScreen />;
  }

  return <V1LoadingScreen />;
}

function V2LoadingScreen() {
  return (
    <div className="v2-loading-screen">
      <div className="v2-loading-bg" />

      <div className="v2-loading-content">
        {/* Logo */}
        <div className="v2-loading-logo">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" fill="url(#v2-gradient)" />
            <path
              d="M16 18h16v2H16v-2zm0 5h12v2H16v-2zm0 5h8v2h-8v-2z"
              fill="white"
              opacity="0.9"
            />
            <defs>
              <linearGradient id="v2-gradient" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                <stop stopColor="#D97706" />
                <stop offset="1" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Title */}
        <h1 className="v2-loading-title">Claude Code</h1>
        <p className="v2-loading-subtitle">AI-powered development</p>

        {/* Loading indicator */}
        <div className="v2-loading-dots">
          {loadingDotAnimationDelays.map((delay, index) => (
            <div
              key={index}
              className="v2-loading-dot"
              style={{ animationDelay: delay }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function V1LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary shadow-sm">
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" fill="currentColor" className="text-primary-foreground" />
            </svg>
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-foreground">Claude Code UI</h1>

        <div className="flex items-center justify-center space-x-2">
          {loadingDotAnimationDelays.map((delay, index) => (
            <div
              key={index}
              className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
              style={{ animationDelay: delay }}
            />
          ))}
        </div>

        <p className="mt-2 text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
