import { Howl } from 'howler';

export class AudioPlayer {
  private audio: Howl;

  constructor() {
    this.audio = new Howl({
      src: ['https://cdn.cntrl.site/client-app-files/hover.b226066e.mp3'],
      volume: 1,
    });  
  }

  play() {
    this.audio.play();
  }
}
