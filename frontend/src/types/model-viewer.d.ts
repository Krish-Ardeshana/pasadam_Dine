import * as React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          poster?: string;
          alt?: string;
          'camera-controls'?: boolean | string;
          'auto-rotate'?: boolean | string;
          'rotation-per-second'?: string;
          'shadow-intensity'?: string | number;
          'exposure'?: string | number;
          ar?: boolean | string;
          'ar-modes'?: string;
          'ar-scale'?: string;
          loading?: 'auto' | 'lazy' | 'eager';
          reveal?: 'auto' | 'interaction' | 'manual';
          style?: React.CSSProperties;
          ref?: React.Ref<any>;
        },
        HTMLElement
      >;
    }
  }

  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        'model-viewer': React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLElement> & {
            src?: string;
            poster?: string;
            alt?: string;
            'camera-controls'?: boolean | string;
            'auto-rotate'?: boolean | string;
            'rotation-per-second'?: string;
            'shadow-intensity'?: string | number;
            'exposure'?: string | number;
            ar?: boolean | string;
            'ar-modes'?: string;
            'ar-scale'?: string;
            loading?: 'auto' | 'lazy' | 'eager';
            reveal?: 'auto' | 'interaction' | 'manual';
            style?: React.CSSProperties;
            ref?: React.Ref<any>;
          },
          HTMLElement
        >;
      }
    }
  }
}

export {};
