export const PIANO_KEYS = [
  { note: 'C4', keyLabel: 'A', keyboardKey: 'a', type: 'white' },
  { note: 'C#4', keyLabel: 'W', keyboardKey: 'w', type: 'black' },
  { note: 'D4', keyLabel: 'S', keyboardKey: 's', type: 'white' },
  { note: 'D#4', keyLabel: 'E', keyboardKey: 'e', type: 'black' },
  { note: 'E4', keyLabel: 'D', keyboardKey: 'd', type: 'white' },
  { note: 'F4', keyLabel: 'F', keyboardKey: 'f', type: 'white' },
  { note: 'F#4', keyLabel: 'T', keyboardKey: 't', type: 'black' },
  { note: 'G4', keyLabel: 'G', keyboardKey: 'g', type: 'white' },
  { note: 'G#4', keyLabel: 'Y', keyboardKey: 'y', type: 'black' },
  { note: 'A4', keyLabel: 'H', keyboardKey: 'h', type: 'white' },
  { note: 'A#4', keyLabel: 'U', keyboardKey: 'u', type: 'black' },
  { note: 'B4', keyLabel: 'J', keyboardKey: 'j', type: 'white' },
  { note: 'C5', keyLabel: 'K', keyboardKey: 'k', type: 'white' },
  { note: 'C#5', keyLabel: 'O', keyboardKey: 'o', type: 'black' },
  { note: 'D5', keyLabel: 'L', keyboardKey: 'l', type: 'white' },
  { note: 'D#5', keyLabel: 'P', keyboardKey: 'p', type: 'black' },
  { note: 'E5', keyLabel: ';', keyboardKey: ';', type: 'white' },
  { note: 'F5', keyLabel: "'", keyboardKey: "'", type: 'white' },
];

// Helper to determine the left position of black keys
// Assuming each white key has a fixed width of a unit
// Black keys are positioned between white keys
export const calculateKeyPositions = (keys) => {
  let whiteKeyIndex = 0;
  return keys.map((k) => {
    if (k.type === 'white') {
      const position = { ...k, offsetIndex: whiteKeyIndex };
      whiteKeyIndex++;
      return position;
    } else {
      // Black key is positioned based on the previous white key
      return { ...k, offsetIndex: whiteKeyIndex - 0.5 };
    }
  });
};
