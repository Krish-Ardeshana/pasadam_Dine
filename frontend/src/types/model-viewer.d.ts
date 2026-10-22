import * as React from 'react';

type ModelViewerAttributes = React.HTMLAttributes<HTMLElement> & {
  src?: string;
  'ios-src'?: string;
  poster?: string;
  alt?: string;
  'camera-controls'?: boolean | string;
  'auto-rotate'?: boolean | string;
  'rotation-per-second'?: string;
  'shadow-intensity'?: string | number;
  'shadow-softness'?: string | number;
  exposure?: string | number;
  bounds?: 'tight' | 'legacy';
  'camera-orbit'?: string;
  'field-of-view'?: string;
  'environment-image'?: string;
  ar?: boolean | string;
  'ar-modes'?: string;
  'ar-scale'?: string;
  loading?: 'auto' | 'lazy' | 'eager';
  reveal?: 'auto' | 'interaction' | 'manual';
  style?: React.CSSProperties;
  ref?: React.Ref<any>;
  [key: string]: any;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<ModelViewerAttributes, HTMLElement>;
    }
  }

  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        'model-viewer': React.DetailedHTMLProps<ModelViewerAttributes, HTMLElement>;
      }
    }
  }
}

export {};
