import React from 'react';
import Spritesheet from 'react-responsive-spritesheet';
import { AnimationDetails, ChefAnimationType, ChefSpriteConfig } from '@/types/models';
import { usePlayerStore } from '@/state/player/playerStore';

interface ChefSpriteProps {
    // Props can be added if needed, but for now, it will get most data from the store
    className?: string;
    style?: React.CSSProperties;
}

const ChefSprite = (props: ChefSpriteProps) => {
    console.log('ChefSprite component rendering');
    const {
        className,
        style,
    } = props;

    const player = usePlayerStore((state) => state.player);
    const currentAnimationName = player.animationState;
    const spriteConfig = player.spriteConfig;

    if (!spriteConfig || !currentAnimationName) {
        // Fallback or loading state if config or animation name is not available
        return <div style={{ width: 64, height: 64, backgroundColor: 'lightgray' }}>?</div>;
    }

    const animationDetails = spriteConfig[currentAnimationName as keyof ChefSpriteConfig];

    if (!animationDetails) {
        console.warn(`No animation details for chef state: ${currentAnimationName}`);
        // Fallback to idle if current animation is not found, or a default placeholder
        const idleDetails = spriteConfig.idle;
        if (!idleDetails) {
            return <div style={{ width: 64, height: 64, backgroundColor: 'pink' }}>!</div>;
        }
        return <StaticChefSprite animationDetails={idleDetails} className={className} style={style} />;
    }

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
                key={currentAnimationName} // Add key to re-trigger spritesheet on animation change
                image={sheetUrl}
                widthFrame={sheetFrameWidth}
                heightFrame={sheetFrameHeight}
                steps={steps}
                fps={fps}
                autoplay={true}
                loop={true} // Most animations will loop, specific actions might not
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

// Simple component to render a static frame (e.g., first frame of idle) as fallback
const StaticChefSprite: React.FunctionComponent<{ animationDetails: AnimationDetails, className?: string, style?: React.CSSProperties }> = ({ animationDetails, className, style }) => {
    const {
        sheetUrl,
        sheetFrameWidth,
        sheetFrameHeight,
        characterArtWidth,
        characterArtHeight,
    } = animationDetails;
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
                backgroundImage: `url(${sheetUrl})`,
                backgroundPosition: `-${horizontalOffset}px -${verticalOffset}px`,
                backgroundRepeat: 'no-repeat',
                ...style,
            }}
        />
    );
}

export default ChefSprite; 