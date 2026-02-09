import { StageData } from '../Section';

export const stage2Data: StageData = {
  name: 'Amusement Park',
  parallaxColors: {
    far: '#1a0a2a',
    mid: '#241434',
    near: '#2e1e3e',
  },
  sections: [
    {
      startX: 0,
      endX: 640,
      background: { color: '#2a1a3e' },
      waves: [
        {
          triggerX: 50,
          enemies: [
            { type: 'galsia', x: 300, groundY: 150 },
            { type: 'signal', x: 330, groundY: 170 },
          ],
        },
        {
          triggerX: 200,
          arenaLock: true,
          enemies: [
            { type: 'signal', x: 350, groundY: 140 },
            { type: 'signal', x: 370, groundY: 180 },
            { type: 'galsia', x: -30, groundY: 160 },
            { type: 'galsia', x: -50, groundY: 140 },
          ],
        },
        {
          triggerX: 450,
          enemies: [
            { type: 'donovan', x: 350, groundY: 150 },
            { type: 'electra', x: 380, groundY: 170 },
          ],
        },
      ],
      pickups: [
        { type: 'apple', x: 550, groundY: 160 },
      ],
    },
    {
      startX: 640,
      endX: 1280,
      background: { color: '#251535' },
      waves: [
        {
          triggerX: 700,
          arenaLock: true,
          enemies: [
            { type: 'electra', x: 350, groundY: 150 },
            { type: 'signal', x: 370, groundY: 130 },
            { type: 'donovan', x: -20, groundY: 170 },
            { type: 'galsia', x: -40, groundY: 150 },
          ],
        },
        {
          triggerX: 1000,
          arenaLock: true,
          enemies: [
            { type: 'electra', x: 350, groundY: 160 },
            { type: 'electra', x: 360, groundY: 140 },
            { type: 'donovan', x: -30, groundY: 170 },
            { type: 'signal', x: -50, groundY: 150 },
          ],
        },
      ],
      weapons: [
        { type: 'knife', x: 850, groundY: 160 },
      ],
      pickups: [
        { type: 'chicken', x: 1200, groundY: 160 },
      ],
    },
    {
      startX: 1280,
      endX: 1600,
      background: { color: '#201030' },
      waves: [
        {
          triggerX: 1350,
          arenaLock: true,
          enemies: [
            { type: 'signal', x: 350, groundY: 150 },
            { type: 'donovan', x: 360, groundY: 170 },
          ],
        },
      ],
      boss: { type: 'jet', x: 1550, groundY: 160 },
    },
  ],
};
