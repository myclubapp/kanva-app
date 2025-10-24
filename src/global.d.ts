// Global type definitions for custom web components

import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'game-preview': any;
      'game-result': any;
    }
  }
}
