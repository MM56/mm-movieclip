/**
 * Movieclip class
 *
 * @class
 *
 * @license {@link https://opensource.org/licenses/MIT|MIT}
 *
 */
class Movieclip {

	/**
	 * Creates an instance of Simple
	 *
	 * @constructor
	 */
	constructor(fps = 30) {
		this.gotoAndPlay = this.gotoAndPlay.bind(this);
		this.gotoAndStop = this.gotoAndStop.bind(this);
		this.validateFrame = this.validateFrame.bind(this);
		this.addFrameScript = this.addFrameScript.bind(this);
		this.removeFrameScript = this.removeFrameScript.bind(this);
		this.play = this.play.bind(this);
		this.stop = this.stop.bind(this);
		this.startRendering = this.startRendering.bind(this);
		this.stopRendering = this.stopRendering.bind(this);
		this.render = this.render.bind(this);
		this.tick = this.tick.bind(this);

		/** 
		 * Number of frames per second to be played (stored but not used)
		 * @member {number}
		*/
		this.fps = fps;

		/** 
		 * Name (mostly for debugging purpose)
		 * @member {string}
		*/
		this.name = null;

		/** 
		 * When set to true, movieclip plays backwards
		 * @member {boolean}
		*/
		this.reverse = false;

		/** 
		 * @member {boolean}
		*/
		this.loop = true;

		/** 
		 * When loop is set to true, movieclip plays back and forth
		 * @member {boolean}
		*/
		this.yoyo = false;

		/** 
		 * @member {number}
		*/
		this.currentFrame = 0;

		/** 
		 * If loop is set to true but not yoyo, when playback head has to start back, it goes to this *loopFrame*
		 * @member {number}
		*/
		this.loopFrame  = 0;

		/** 
		 * Total number of frames
		 * @member {number}
		*/
		this.totalFrames = 0;

		this._isPlaying = false;
		this._shouldRender = false;
		this._framesScripts = [];
	}

	/** 
	 * Moves head to *frame* and starts playing
	 * @param {number} frame
	*/
	gotoAndPlay(frame) {
		this.currentFrame = this.validateFrame(frame);
		this.play();
	}

	/** 
	 * Moves head to *frame* and stops there
	 * @param {number} frame
	*/
	gotoAndStop(frame) {
		this.currentFrame = this.validateFrame(frame);
		this.render();
		this.stop();
	}

	/** 
	 * Returns a correct value of a *frame* number (should be >= 0 and <= totalFrames - 1)
	 * @param {number} frame
	 * @returns {number}
	*/
	validateFrame(frame) {
		if (frame < 0) {
			frame = 0;
		} else if (frame > (this.totalFrames - 1)) {
			frame = this.totalFrames - 1;
		}
		return frame;
	}

	/** 
	 * Adds a *callback* for a *frame* – the *callback* will be triggered when head is at the specified *frame*
	 * @param {number} frame
	 * @param {function} callback Passing a *null* value acts like a *removeFrameScript*
	*/
	addFrameScript(frame, callback) {
		frame = this.validateFrame(frame);

		// if callback is null, we remove the script for the frame
		if (callback === null) {
			this.removeFrameScript(frame);
			return;
		}

		// if script already registered for this frame, we override it
		const nbScripts = this._framesScripts.length;
		for (let i = 0; i < nbScripts; i++) {
			const frameScript = this._framesScripts[ i ];
			if (frameScript.frame === frame) {
				frameScript.callback = callback;
				return;
			}
		}

		this._framesScripts.push({ frame, callback });
	}

	/** 
	 * Removes a *callback* for a *frame* – the *callback* won't be triggered any longer when head is at the specified *frame*
	 * @param {number} frame
	*/
	removeFrameScript(frame) {
		frame = this.validateFrame(frame);
		const nbScripts = this._framesScripts.length;
		for (let i = 0; i < nbScripts; i++) {
			const frameScript = this._framesScripts[ i ];
			if (frameScript.frame === frame) {
				this._framesScripts.splice(this._framesScripts.indexOf(frameScript), 1);
				break;
			}
		}
	}

	/** 
	 * Starts playing from *currentFrame*
	*/
	play() {
		this.render();
		this._isPlaying = true;
		this.startRendering();
	}

	/** 
	 * Stops playing from *currentFrame*
	*/
	stop() {
		this._isPlaying = false;
		this.stopRendering();
	}

	/** 
	 * Allow rendering and also framescripts to be triggered
	*/
	startRendering() {
		this._shouldRender = true;
	}

	/** 
	 * Stops rendering and also framescripts to be triggered
	*/
	stopRendering() {
		this._shouldRender = false;
	}

	/** 
	 * Renders *currentFrame*
	*/
	render() {
		const nbScripts = this._framesScripts.length;
		for (let i = 0; i < nbScripts; i++) {
			const frameScript = this._framesScripts[ i ];
			if (frameScript.frame === this.currentFrame) {
				frameScript.callback();
				break;
			}
		}
	}

	/** 
	 * Has to be called to update Movieclip state
	*/
	tick() {
		// check if it has to be rendered
		if (this._isPlaying) {
			if (this.reverse) {
				if ((this.currentFrame - 1) < 0) {
					if (this.loop) {
						if (this.yoyo) {
							this.currentFrame++;
							this.reverse = false;
						} else {
							this.currentFrame = this.totalFrames - 1;
						}
					}
				} else {
					this.currentFrame--;
				}
			} else {
				if ((this.currentFrame + 1) > (this.totalFrames - 1)) {
					if (this.loop) {
						if (this.yoyo) {
							this.currentFrame--;
							this.reverse = true;
						} else {
							this.currentFrame = this.loopFrame;
						}
					}
				} else {
					this.currentFrame++;
				}
			}
			if (this._shouldRender) {
				this.render();
			}
		}
	}

}

export default Movieclip;
