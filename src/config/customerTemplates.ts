import { Customer } from '@/types/models';

export const customerTemplates: Omit<Customer, 'id' | 'order' | 'patience' | 'arrivalTime' | 'status' | 'satisfaction' | 'tip' | 'tableId'>[] = [
    {
        // id: 'girl_1', // ID will be generated dynamically
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
        // id: 'girl_2',
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
        // id: 'man_1',
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
        // id: 'girl_3',
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
        // id: 'girl_4',
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
        // id: 'girl_5',
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
        // id: 'man_2',
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
        // id: 'man_3',
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
        // id: 'man_4',
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
        // id: 'man_5',
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