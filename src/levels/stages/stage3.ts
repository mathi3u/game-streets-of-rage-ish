import { StageData } from '../Section';

export const stage3Data: StageData = {
  name: 'Factory',
  parallaxColors: {
    far: '#0a0a0a',
    mid: '#141414',
    near: '#1e1e1e',
  },
  sections: [
    {
      startX: 0,
      endX: 640,
      background: { color: '#1a1a1a' },
      waves: [
        {
          triggerX: 50,
          enemies: [
            { type: 'donovan', x: 300, groundY: 150 },
            { type: 'donovan', x: 330, groundY: 170 },
            { type: 'galsia', x: 350, groundY: 140 },
          ],
        },
        {
          triggerX: 200,
          arenaLock: true,
          enemies: [
            { type: 'bigben', x: 350, groundY: 160 },
            { type: 'galsia', x: -30, groundY: 140 },
            { type: 'galsia', x: -50, groundY: 180 },
          ],
        },
        {
          triggerX: 450,
          arenaLock: true,
          enemies: [
            { type: 'electra', x: 350, groundY: 150 },
            { type: 'signal', x: 370, groundY: 170 },
            { type: 'donovan', x: -30, groundY: 160 },
            { type: 'bigben', x: -60, groundY: 150 },
          ],
        },
      ],
      pickups: [
        { type: 'apple', x: 550, groundY: 160 },
      ],
      weapons: [
        { type: 'pipe', x: 350, groundY: 180 },
      ],
    },
    {
      startX: 640,
      endX: 1280,
      background: { color: '#161616' },
      waves: [
        {
          triggerX: 700,
          arenaLock: true,
          enemies: [
            { type: 'bigben', x: 350, groundY: 150 },
            { type: 'electra', x: 370, groundY: 130 },
            { type: 'signal', x: -20, groundY: 170 },
            { type: 'donovan', x: -40, groundY: 150 },
          ],
        },
        {
          triggerX: 1000,
          arenaLock: true,
          enemies: [
            { type: 'bigben', x: 350, groundY: 160 },
            { type: 'bigben', x: -50, groundY: 150 },
            { type: 'electra', x: 360, groundY: 140 },
            { type: 'signal', x: -30, groundY: 170 },
          ],
        },
      ],
      pickups: [
        { type: 'chicken', x: 1150, groundY: 160 },
      ],
    },
    {
      startX: 1280,
      endX: 1600,
      background: { color: '#121212' },
      waves: [
        {
          triggerX: 1350,
          arenaLock: true,
          enemies: [
            { type: 'donovan', x: 350, groundY: 150 },
            { type: 'electra', x: 360, groundY: 170 },
            { type: 'signal', x: -30, groundY: 160 },
          ],
        },
      ],
      boss: { type: 'abadede', x: 1550, groundY: 160 },
    },
  ],
};
