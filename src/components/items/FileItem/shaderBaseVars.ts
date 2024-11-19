export const baseVariables = `precision mediump float;
uniform sampler2D u_image;
uniform sampler2D u_pattern;
uniform vec2 u_imgDimensions;
uniform vec2 u_patternDimensions;
uniform float u_time;
uniform vec2 u_cursor;
varying vec2 v_texCoord;`;
