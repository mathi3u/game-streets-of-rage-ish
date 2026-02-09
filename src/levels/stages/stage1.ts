import { StageData } from '../Section';

export const stage1Data: StageData = {
  name: 'Downtown',
  parallaxColors: {
    far: '#0a0a2a',
    mid: '#141434',
    near: '#1e1e3e',
  },
  sections: [
    // Section 1: Street entrance
    {
      startX: 0,
      endX: 640,
      background: { color: '#1a1a2e' },
      waves: [
        {
          triggerX: 50,
          enemies: [
            { type: 'galsia', x: 300, groundY: 150 },
            { type: 'galsia', x: 330, groundY: 170 },
          ],
        },
        {
          triggerX: 200,
          arenaLock: true,
          enemies: [
            { type: 'galsia', x: 350, groundY: 140 },
            { type: 'galsia', x: 370, groundY: 180 },
            { type: 'galsia', x: -30, groundY: 160 },
          ],
        },
        {
          triggerX: 400,
          enemies: [
            { type: 'galsia', x: 350, groundY: 150 },
            { type: 'donovan', x: 370, groundY: 170 },
          ],
        },
      ],
      pickups: [
        { type: 'apple', x: 500, groundY: 160 },
      ],
    },
    // Section 2: Alley
    {
      startX: 640,
      endX: 1280,
      background: { color: '#151528' },
      waves: [
        {
          triggerX: 700,
          arenaLock: true,
          enemies: [
            { type: 'donovan', x: 350, groundY: 150 },
            { type: 'galsia', x: 370, groundY: 130 },
            { type: 'galsia', x: -20, groundY: 170 },
            { type: 'donovan', x: -40, groundY: 150 },
          ],
        },
        {
          triggerX: 1000,
          enemies: [
            { type: 'galsia', x: 350, groundY: 160 },
            { type: 'galsia', x: 360, groundY: 140 },
            { type: 'signal', x: 380, groundY: 170 },
          ],
        },
      ],
      weapons: [
        { type: 'pipe', x: 900, groundY: 160 },
      ],
      pickups: [
        { type: 'chicken', x: 1200, groundY: 160 },
      ],
    },
    // Section 3: Boss area
    {
      startX: 1280,
      endX: 1600,
      background: { color: '#121225' },
      waves: [
        {
          triggerX: 1350,
          arenaLock: true,
          enemies: [
            { type: 'galsia', x: 350, groundY: 150 },
            { type: 'galsia', x: 360, groundY: 170 },
          ],
        },
      ],
      boss: { type: 'barbon', x: 1550, groundY: 160 },
    },
  ],
};
