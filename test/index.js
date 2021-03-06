import test from 'ava';

import Movieclip from '../src/index';

test.beforeEach(t => {
	t.context.mc = new Movieclip();
});

test('idle test', t => {
	t.context.mc.totalFrames = 1;
	t.is(t.context.mc.currentFrame, 0);
});

test('default fps', t => {
	t.is(t.context.mc.fps, 30);
});

test('validate frame <', t => {
	t.context.mc.totalFrames = 1;
	t.is(t.context.mc.validateFrame(-3), 0);
});

test('validate frame >', t => {
	t.context.mc.totalFrames = 2;
	t.is(t.context.mc.validateFrame(3), 1);
});

test('play test', t => {
	t.context.mc.totalFrames = 2;
	t.context.mc.play();
	t.context.mc.tick();
	t.is(t.context.mc.currentFrame, 1);
});

test('play loop', t => {
	t.context.mc.totalFrames = 2;
	t.context.mc.play();
	t.context.mc.tick();
	// goes back to first frame
	t.context.mc.tick();
	t.is(t.context.mc.currentFrame, 0);
});

test('play reverse loop', t => {
	t.context.mc.totalFrames = 3;
	t.context.mc.reverse = true;
	t.context.mc.play();
	t.context.mc.tick();
	t.is(t.context.mc.currentFrame, 2);
});

test('play yoyo start', t => {
	t.context.mc.totalFrames = 3;
	t.context.mc.yoyo = true;
	t.context.mc.reverse = true;
	t.context.mc.gotoAndPlay(1);
	// goes to first frame
	t.context.mc.tick();
	// goes forwared to second frame
	t.context.mc.tick();
	t.is(t.context.mc.currentFrame, 1);
});

test('play yoyo end', t => {
	t.context.mc.totalFrames = 4;
	t.context.mc.yoyo = true;
	t.context.mc.gotoAndPlay(3);
	t.context.mc.tick();
	t.is(t.context.mc.currentFrame, 2);
});

test('addFrameScript', t => {
	t.context.mc.totalFrames = 2;
	t.context.mc.addFrameScript(1, () => {
		t.context.mc.stop();
	});
	t.context.mc.play();
	t.context.mc.tick();
	t.is(t.context.mc.currentFrame, 1);
	t.context.mc.tick();
	t.is(t.context.mc.currentFrame, 1);
	t.context.mc.tick();
	t.is(t.context.mc.currentFrame, 1);
});

test('add label to frame', t => {
	t.context.mc.totalFrames = 10;
	t.context.mc.addLabelToFrame('test', 8);
	t.context.mc.gotoAndStop('test');
	t.is(t.context.mc.currentFrame, 8);
});

test('remove label from frame', t => {
	t.context.mc.totalFrames = 10;
	t.context.mc.addLabelToFrame('test', 8);
	t.context.mc.removeLabelFromFrame('test');
	t.context.mc.gotoAndStop('test');
	t.is(t.context.mc.currentFrame, 0);
});

test('get label for frame', t => {
	t.context.mc.totalFrames = 10;
	t.context.mc.addLabelToFrame('in', 0);
	t.context.mc.addLabelToFrame('out', 5);
	t.is(t.context.mc.getLabelForFrame(5), 'out');
});
