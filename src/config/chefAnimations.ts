import { ChefSpriteConfig, AnimationDetails } from '@/types/models';

// Placeholder function to get actual dimensions and steps - these need to be accurate
const getDetails = (url: string, steps = 1, fps = 10, w = 43, h = 84, artW = 43, artH = 84): AnimationDetails => ({
    sheetUrl: `/assets/images/characters/chef_1/${url}.png`,
    sheetFrameWidth: w,      // Placeholder: actual width of one frame in the sheet
    sheetFrameHeight: h,     // Placeholder: actual height of one frame in the sheet
    characterArtWidth: artW, // Placeholder: actual width of the character art
    characterArtHeight: artH,// Placeholder: actual height of the character art
    steps: steps,            // Placeholder: number of frames in the animation
    fps: fps,                // Placeholder: frames per second
});

export const chefSpriteConfig: ChefSpriteConfig = {
    idle: getDetails('idle', 6, 5, 34, 68, 34, 68), 

    running_down: getDetails('running_down', 6, 10), 
    running_up: getDetails('running_top', 6, 10),
    running_left: getDetails('running_left', 6, 10),
    running_right: getDetails('running_right', 6, 10),

    lifting_down: getDetails('lifting_down', 4, 8),
    lifting_up: getDetails('lifting_top', 4, 8),
    lifting_left: getDetails('lifting_left', 4, 8),
    lifting_right: getDetails('lifting_right', 4, 8),

    interacting_down: getDetails('interacting_down', 3, 8),
    interacting_up: getDetails('interacting_top', 3, 8),
    interacting_left: getDetails('interacting_left', 3, 8),
    interacting_right: getDetails('interacting_right', 3, 8),

    dropping_down: getDetails('dropping_down', 4, 8),
    dropping_up: getDetails('dropping_top', 4, 8),
    dropping_left: getDetails('dropping_left', 4, 8),
    dropping_right: getDetails('dropping_right', 4, 8),

    running_lifting_down: getDetails('running_lifting_down', 6, 10),
    running_lifting_up: getDetails('running_lifting_top', 6, 10),
    running_lifting_left: getDetails('running_lifting_left', 6, 10),
    running_lifting_right: getDetails('running_lifting_right', 6, 10),
}; 