import React from 'react';
import Spritesheet from 'react-responsive-spritesheet';
import { AnimationDetails } from '@/types/models'; // Import the new type

interface CustomerSpriteProps {
    animationDetails: AnimationDetails;
    autoplay?: boolean;
    loop?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

const CustomerSprite = (props: CustomerSpriteProps) => {
    const {
        animationDetails,
        autoplay = true,
        loop = true,
        className,
        style,
    } = props;

    const {
        sheetUrl,
        sheetFrameWidth,
        sheetFrameHeight,
        characterArtWidth,
        characterArtHeight,
        steps,
        fps,
    } = animationDetails;

    // Calculate offsets to center the character art
    const verticalOffset = sheetFrameHeight - characterArtHeight;
    const horizontalOffset = (sheetFrameWidth - characterArtWidth) / 2;

    return (
        <div
            className={className}
            style={{
                width: `${characterArtWidth}px`,
                height: `${characterArtHeight}px`,
                overflow: 'hidden',
                position: 'relative',
                ...style,
            }}
        >
            <Spritesheet
                image={sheetUrl} // Use sheetUrl from animationDetails
                widthFrame={sheetFrameWidth}
                heightFrame={sheetFrameHeight}
                steps={steps}
                fps={fps}
                direction='forward'
                autoplay={autoplay}
                loop={loop}
                isResponsive={false}
                style={{
                    position: 'absolute',
                    top: `-${verticalOffset}px`,
                    left: `-${horizontalOffset}px`,
                }}
            />
        </div>
    );
};

export default CustomerSprite; 