import React from 'react';
import Svg, { Path, G } from 'react-native-svg';

interface GoogleIconProps {
  size?: number;
}

const GoogleIcon: React.FC<GoogleIconProps> = ({ size = 24 }) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      accessible
      accessibilityLabel="Google"
    >
      <G fill="none" fillRule="evenodd">
        <Path
          d="M20.64 12.2045c0-.638-.059-1.252-.164-1.845H12v3.495h4.822c-.208 1.144-.847 2.11-1.795 2.747v2.258h2.908c1.702-1.57 2.684-3.88 2.684-6.655z"
          fill="#4285F4"
        />
        <Path
          d="M12 21c3.24 0 5.933-1.07 7.91-2.909l-2.909-2.258c-.806.54-1.84.858-3.001.858-2.322 0-4.285-1.57-4.98-3.67H3.09v2.33c1.96 3.88 5.922 6.45 8.91 6.45z"
          fill="#34A853"
        />
        <Path
          d="M7.02 14.18c-.19-.54-.298-1.11-.298-1.71s.108-1.17.298-1.71V8.44H4.09C3.45 9.71 3.092 11.27 3.092 12.47c0 1.21.358 2.77 1.001 4.04L7.02 14.18z"
          fill="#FBBC05"
        />
        <Path
          d="M12 7.5c1.77 0 3.35.61 4.605 1.795L19.22 6.12C17.205 4.18 14.71 3 12 3c-2.988 0-5.95 2.57-8.91 6.45L7.02 11.09C7.715 8.99 9.678 7.5 12 7.5z"
          fill="#EA4335"
        />
      </G>
    </Svg>
  );
};

export default React.memo(GoogleIcon);