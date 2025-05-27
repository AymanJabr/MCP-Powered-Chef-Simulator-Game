declare module 'react-responsive-spritesheet' {
    import * as React from 'react';

    interface SpritesheetProps {
        image: string;
        widthFrame: number;
        heightFrame: number;
        steps: number;
        fps: number;
        autoplay?: boolean;
        loop?: boolean;
        direction?: 'forward' | 'rewind';
        timeout?: number;
        startAt?: number;
        endAt?: number;
        background?: string;
        backgroundSize?: string;
        backgroundRepeat?: string;
        backgroundPosition?: string;
        className?: string;
        style?: React.CSSProperties;
        getInstance?: (spritesheet: any) => void; // Consider defining a more specific type for the instance
        onClick?: (spritesheet: any) => void;
        onDoubleClick?: (spritesheet: any) => void;
        onMouseMove?: (spritesheet: any) => void;
        onMouseEnter?: (spritesheet: any) => void;
        onMouseLeave?: (spritesheet: any) => void;
        onMouseOver?: (spritesheet: any) => void;
        onMouseOut?: (spritesheet: any) => void;
        onMouseDown?: (spritesheet: any) => void;
        onMouseUp?: (spritesheet: any) => void;
        onInit?: (spritesheet: any) => void;
        onResize?: (spritesheet: any) => void;
        onPlay?: (spritesheet: any) => void;
        onPause?: (spritesheet: any) => void;
        onLoopComplete?: (spritesheet: any) => void;
        onEachFrame?: (spritesheet: any) => void;
        onEnterFrame?: Array<{
            frame: number;
            callback: () => void;
        }>;
        isResponsive?: boolean;
        pauseOnHover?: boolean;
        // Add any other props the library supports
    }

    const Spritesheet: React.FC<SpritesheetProps>;

    export default Spritesheet;
} 