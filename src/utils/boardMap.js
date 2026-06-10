
export const MAIN_PATH = [
  { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 },
  { x: 6, y: 5 }, { x: 6, y: 4 }, { x: 6, y: 3 }, { x: 6, y: 2 }, { x: 6, y: 1 }, { x: 6, y: 0 },
  { x: 7, y: 0 },
  { x: 8, y: 0 }, { x: 8, y: 1 }, { x: 8, y: 2 }, { x: 8, y: 3 }, { x: 8, y: 4 }, { x: 8, y: 5 },
  { x: 9, y: 6 }, { x: 10, y: 6 }, { x: 11, y: 6 }, { x: 12, y: 6 }, { x: 13, y: 6 }, { x: 14, y: 6 },
  { x: 14, y: 7 },
  { x: 14, y: 8 }, { x: 13, y: 8 }, { x: 12, y: 8 }, { x: 11, y: 8 }, { x: 10, y: 8 }, { x: 9, y: 8 },
  { x: 8, y: 9 }, { x: 8, y: 10 }, { x: 8, y: 11 }, { x: 8, y: 12 }, { x: 8, y: 13 }, { x: 8, y: 14 },
  { x: 7, y: 14 },
  { x: 6, y: 14 }, { x: 6, y: 13 }, { x: 6, y: 12 }, { x: 6, y: 11 }, { x: 6, y: 10 }, { x: 6, y: 9 },
  { x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 }, { x: 2, y: 8 }, { x: 1, y: 8 }, { x: 0, y: 8 },
  { x: 0, y: 7 }, { x: 0, y: 6 }
];

export const SAFE_SPOTS = [
  0, 8, 13, 21, 26, 34, 39, 47
].map(index => MAIN_PATH[index]);

export const isSafeSpot = (x: number, y: number) => 
  SAFE_SPOTS.some(spot => spot.x === x && spot.y === y);

const HOME_STRETCHES = {
  red: [{ x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }],
  green: [{ x: 7, y: 1 }, { x: 7, y: 2 }, { x: 7, y: 3 }, { x: 7, y: 4 }, { x: 7, y: 5 }],
  yellow: [{ x: 13, y: 7 }, { x: 12, y: 7 }, { x: 11, y: 7 }, { x: 10, y: 7 }, { x: 9, y: 7 }],
  blue: [{ x: 7, y: 13 }, { x: 7, y: 12 }, { x: 7, y: 11 }, { x: 7, y: 10 }, { x: 7, y: 9 }]
};

export const START_INDICES = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39
};

export const YARDS = {
  red: [{x: 2, y: 2}, {x: 3, y: 2}, {x: 2, y: 3}, {x: 3, y: 3}],
  green: [{x: 11, y: 2}, {x: 12, y: 2}, {x: 11, y: 3}, {x: 12, y: 3}],
  yellow: [{x: 11, y: 11}, {x: 12, y: 11}, {x: 11, y: 12}, {x: 12, y: 12}],
  blue: [{x: 2, y: 11}, {x: 3, y: 11}, {x: 2, y: 12}, {x: 3, y: 12}],
};

export const HOME_COORD = { x: 7, y: 7 };

export const generatePaths = () => {
  const paths = {};
  const colors = ['red', 'green', 'yellow', 'blue'];
  
  colors.forEach(color => {
    const startIndex = START_INDICES[color];
    const path = [];
    
    for (let i = 0; i < 51; i++) {
      const index = (startIndex + i) % 52;
      path.push(MAIN_PATH[index]);
    }
    
    path.push(...HOME_STRETCHES[color]);
    path.push(HOME_COORD);
    paths[color] = path;
  });
  
  return paths;
};

export const PATHS = generatePaths();
