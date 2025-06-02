import { Customer } from '@/types/models';

export const customerTemplates: Omit<Customer, 'id' | 'order' | 'patience' | 'arrivalTime' | 'status' | 'satisfaction' | 'tip' | 'tableId'>[] = [
    {
        name: 'Alice',
        animationState: 'idle',
        spriteConfig: {
            idle: {
                sheetUrl: '/assets/images/characters/girl_1/Idle.png',
                sheetFrameWidth: 128,
                sheetFrameHeight: 128,
                characterArtWidth: 30,
                characterArtHeight: 75,
                steps: 9,
                fps: 10,
            },
            walk: {
                sheetUrl: '/assets/images/characters/girl_1/Walk.png',
                sheetFrameWidth: 128,
                sheetFrameHeight: 128,
                characterArtWidth: 40,
                characterArtHeight: 75,
                steps: 12,
                fps: 14,
            }
        }
    },
    {
        name: 'Bella',
        animationState: 'idle',
        spriteConfig: {
            idle: {
                sheetUrl: '/assets/images/characters/girl_2/Idle.png',
                sheetFrameWidth: 128,
                sheetFrameHeight: 128,
                characterArtWidth: 35,
                characterArtHeight: 75,
                steps: 7,
                fps: 8,
            },
            walk: {
                sheetUrl: '/assets/images/characters/girl_2/Walk.png',
                sheetFrameWidth: 128,
                sheetFrameHeight: 128,
                characterArtWidth: 35,
                characterArtHeight: 75,
                steps: 12,
                fps: 14,
            }
        }
    },
    {
        name: 'Charles',
        animationState: 'idle',
        spriteConfig: {
            idle: {
                sheetUrl: '/assets/images/characters/man_1/Idle.png',
                sheetFrameWidth: 128,
                sheetFrameHeight: 128,
                characterArtWidth: 35,
                characterArtHeight: 75,
                steps: 5,
                fps: 5,
            },
            walk: {
                sheetUrl: '/assets/images/characters/man_1/Walk.png',
                sheetFrameWidth: 128,
                sheetFrameHeight: 128,
                characterArtWidth: 35,
                characterArtHeight: 75,
                steps: 10,
                fps: 9,
            }
        }
    },
    {
        name: 'Diana',
        animationState: 'idle',
        spriteConfig: {
            idle: {
                sheetUrl: '/assets/images/characters/girl_3/Idle.png',
                sheetFrameWidth: 128,
                sheetFrameHeight: 128,
                characterArtWidth: 35,
                characterArtHeight: 75,
                steps: 6,
                fps: 5,
            },
            walk: {
                sheetUrl: '/assets/images/characters/girl_3/Walk.png',
                sheetFrameWidth: 128,
                sheetFrameHeight: 128,
                characterArtWidth: 35,
                characterArtHeight: 75,
                steps: 12,
                fps: 10,
            }
        }
    },
    {
        name: 'Eva',
        animationState: 'idle',
        spriteConfig: {
            idle: {
                sheetUrl: '/assets/images/characters/girl_4/Idle.png',
                sheetFrameWidth: 128,
                sheetFrameHeight: 128,
                characterArtWidth: 50,
                characterArtHeight: 75,
                steps: 5,
                fps: 5,
            },
            walk: {
                sheetUrl: '/assets/images/characters/girl_4/Walk.png',
                sheetFrameWidth: 128,
                sheetFrameHeight: 128,
                characterArtWidth: 70,
                characterArtHeight: 75,
                steps: 8,
                fps: 8,
            }
        }
    },
    {
        name: 'Fiona',
        animationState: 'idle',
        spriteConfig: {
            idle: {
                sheetUrl: '/assets/images/characters/girl_5/Idle.png',
                sheetFrameWidth: 128,
                sheetFrameHeight: 128,
                characterArtWidth: 50,
                characterArtHeight: 75,
                steps: 5,
                fps: 5,
            },
            walk: {
                sheetUrl: '/assets/images/characters/girl_5/Walk.png',
                sheetFrameWidth: 128,
                sheetFrameHeight: 128,
                characterArtWidth: 85,
                characterArtHeight: 75,
                steps: 8,
                fps: 10,
            }
        }
    },
    {
        name: 'George',
        animationState: 'idle',
        spriteConfig: {
            idle: {
                sheetUrl: '/assets/images/characters/man_2/Idle.png',
                sheetFrameWidth: 128,
                sheetFrameHeight: 128,
                characterArtWidth: 70,
                characterArtHeight: 70,
                steps: 6,
                fps: 6,
            },
            walk: {
                sheetUrl: '/assets/images/characters/man_2/Walk.png',
                sheetFrameWidth: 128,
                sheetFrameHeight: 128,
                characterArtWidth: 70,
                characterArtHeight: 70,
                steps: 10,
                fps: 9,
            }
        }
    },
    {
        name: 'Henry',
        animationState: 'idle',
        spriteConfig: {
            idle: {
                sheetUrl: '/assets/images/characters/man_3/Idle.png',
                sheetFrameWidth: 128,
                sheetFrameHeight: 128,
                characterArtWidth: 70,
                characterArtHeight: 75,
                steps: 6,
                fps: 6,
            },
            walk: {
                sheetUrl: '/assets/images/characters/man_3/Walk.png',
                sheetFrameWidth: 128,
                sheetFrameHeight: 128,
                characterArtWidth: 70,
                characterArtHeight: 75,
                steps: 10,
                fps: 10,
            }
        }
    },
    {
        name: 'Ian',
        animationState: 'idle',
        spriteConfig: {
            idle: {
                sheetUrl: '/assets/images/characters/man_4/Idle.png',
                sheetFrameWidth: 128,
                sheetFrameHeight: 128,
                characterArtWidth: 70,
                characterArtHeight: 75,
                steps: 7,
                fps: 7,
            },
            walk: {
                sheetUrl: '/assets/images/characters/man_4/Walk.png',
                sheetFrameWidth: 128,
                sheetFrameHeight: 128,
                characterArtWidth: 70,
                characterArtHeight: 75,
                steps: 10,
                fps: 11,
            }
        }
    },
    {
        name: 'Jack',
        animationState: 'idle',
        spriteConfig: {
            idle: {
                sheetUrl: '/assets/images/characters/man_5/Idle.png',
                sheetFrameWidth: 128,
                sheetFrameHeight: 128,
                characterArtWidth: 70,
                characterArtHeight: 75,
                steps: 7,
                fps: 7,
            },
            walk: {
                sheetUrl: '/assets/images/characters/man_5/Walk.png',
                sheetFrameWidth: 128,
                sheetFrameHeight: 128,
                characterArtWidth: 70,
                characterArtHeight: 75,
                steps: 10,
                fps: 10,
            }
        }
    }
]; 