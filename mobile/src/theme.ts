export const themes = {
  light: {
    background: '#F8F6FC', surface: '#FFFDFF', text: '#292532',
    muted: '#71677E', border: '#E5DEEE', accent: '#766090', tint: '#EEE6F7',
  },
  dark: {
    background: '#211F27', surface: '#2D2935', text: '#F5F0FC',
    muted: '#BDB2CC', border: '#494151', accent: '#CAB1EB', tint: '#3B3148',
  },
};

export type Colors = typeof themes.light;
