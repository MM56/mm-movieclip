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
	 * @param {object} options
	 * @param {number} [options.fps=30]
	 * @param {function} [options.frameRenderer=null]
	 * @param {} [options.framesProvider=null]
	 * @param {boolean} [options.loop=true]
	 * @param {number} [options.loopFrame=0]
	 * @param {string} [options.name='']
	 * @param {boolean} [options.reverse=false]
	 * @param {number} [options.startFrame=0]
	 * @param {number} [options.totalFrames=0]
	 * @param {boolean} [options.yoyo=false]
	 */
	constructor(
		{
			fps = 30,
			frameRenderer = null,
			framesProvider = null,
			loop = true,
			loopFrame = 0,
			name = '',
			reverse = false,
			startFrame = 0,
			totalFrames = 0,
			yoyo = false,
		} = {}
	) {
		// bind functions
		this.addFrameScript = this.addFrameScript.bind(this);
		this.addLabelToFrame = this.addLabelToFrame.bind(this);
		this.getLabelForFrame = this.getLabelForFrame.bind(this);
		this.gotoAndPlay = this.gotoAndPlay.bind(this);
		this.gotoAndStop = this.gotoAndStop.bind(this);
		this.play = this.play.bind(this);
		this.removeFrameScript = this.removeFrameScript.bind(this);
		this.removeLabelFromFrame = this.removeLabelFromFrame.bind(this);
		this.render = this.render.bind(this);
		this.startRendering = this.startRendering.bind(this);
		this.stop = this.stop.bind(this);
		this.stopRendering = this.stopRendering.bind(this);
		this.tick = this.tick.bind(this);
		this.validateFrame = this.validateFrame.bind(this);

		// protected members
		this._isPlaying = false;
		this._shouldRender = false;
		this._framesScripts = [];
		this._labels = {};

		/** 
		 * @member {number}
		 */
		this.currentFrame = startFrame;

		/** 
		 * Number of frames per second to be played (stored but not used)
		 * @member {number}
		 */
		this.fps = fps;

		/** 
		 * Render a frame – the movieclip instance will be passed in parameter of this callback
		 * @member {function}
		 */
		this.frameRenderer = frameRenderer;

		/** 
		 * If frames sources are handled in any way, it stores a reference here for practical purpose.
		 * It is advised to update totalFrames.
		 * @member {}
		 */
		this.framesProvider = framesProvider;

		/** 
		 * @member {boolean}
		 */
		this.loop = loop;

		/** 
		 * If loop is set to true but not yoyo, when playback head has to start back, it goes to this *loopFrame*
		 * @member {number}
		 */
		this.loopFrame  = loopFrame;

		/** 
		 * Name (mostly for debugging purpose)
		 * @member {string}
		 */
		this.name = name;

		/** 
		 * When set to true, movieclip plays backwards
		 * @member {boolean}
		 */
		this.reverse = reverse;

		/** 
		 * Total number of frames
		 * @member {number}
		 */
		this.totalFrames = totalFrames;

		/** 
		 * When loop is set to true, movieclip plays back and forth
		 * @member {boolean}
		 */
		this.yoyo = yoyo;
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
	 * Adds a *label* to a *frame*
	 * @param {string} label
	 * @param {number} frame
	 */
	addLabelToFrame(label, frame) {
		if (typeof frame === 'string') {
			throw new Error('frame parameter must not be a string');
		}

		frame = this.validateFrame(frame);

		if (typeof label !== 'string') {
			throw new Error('label parameter is not a string');
		}

		this._labels[ label ] = frame;
	}

	/** 
	 * Returns label for a frame number
	 * @returns {string}
	 */
	getLabelForFrame(frame) {
		frame = this.validateFrame(frame);

		let nearestLabel = null;
		let nearestFrame = -1;
		for (const label in this._labels) {
			const frameStart = this._labels[ label ];
			if (frame >= frameStart && frameStart > nearestFrame) {
				nearestLabel = label;
				nearestFrame = frameStart;
			}
		}

		return nearestLabel;
	}

	/** 
	 * Moves head to *frame* and starts playing
	 * @param {number|string} frame
	 */
	gotoAndPlay(frame) {
		this.currentFrame = this.validateFrame(frame);
		this.play();
	}

	/** 
	 * Moves head to *frame* and stops there
	 * @param {number|string} frame
	 */
	gotoAndStop(frame) {
		this.currentFrame = this.validateFrame(frame);
		this.render();
		this.stop();
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
	 * Removes a *label* from a *frame*
	 * @param {string} label
	 * @param {number} frame
	 */
	removeLabelFromFrame(label) {
		if (this._labels[ label ] !== undefined) {
			delete this._labels[ label ];
		}
	}

	/** 
	 * Renders *currentFrame*
	 */
	render() {
		if (typeof this.frameRenderer === 'function') {
			this.frameRenderer(this);
		}

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
	 * Allow rendering and also framescripts to be triggered
	 */
	startRendering() {
		this._shouldRender = true;
	}

	/** 
	 * Stops playing from *currentFrame*
	 */
	stop() {
		this._isPlaying = false;
		this.stopRendering();
	}

	/** 
	 * Stops rendering and also framescripts to be triggered
	 */
	stopRendering() {
		this._shouldRender = false;
	}

	/** 
	 * Has to be called to update Movieclip state
	 */
	tick() {
		if (!this._isPlaying) {
			return;
		}

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

	/** 
	 * Returns a correct value of a *frame* number (should be >= 0 and <= totalFrames - 1)
	 * @param {number} frame
	 * @returns {number}
	 */
	validateFrame(frame) {
		if (typeof frame === 'string') {
			if (this._labels[ frame ] !== undefined) {
				frame = this._labels[ frame ];
			} else {
				frame = 0;
			}
		} else {
			if (frame < 0) {
				frame = 0;
			} else if (frame > (this.totalFrames - 1)) {
				frame = this.totalFrames - 1;
			}
		}
		return frame;
	}

}

export default Movieclip;
