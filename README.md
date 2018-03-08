# MM Movieclip

Flash based Movieclip class – acts like a virtual timeline

## Usage

### Basic

Basic example.

```js
import Movieclip from '@merci-michel/mm-movieclip'
import Render from '@merci-michel/mm-render'

const mc = new Movieclip()
mc.totalFrames = 2;
mc.addFrameScript(1, () => {
	mc.stop();
});
mc.play();

function render() {
	mc.tick();
}

Render.init();
Render.add(render, mc.fps);
```

Check docs for more advanced usage

## Build

To build the sources with `babel` in `./lib` directory :

```sh
npm run build
```

## Documentation

To generate the `JSDoc` :

```sh
npm run docs
```

To generate the documentation and deploy on `gh-pages` branch :

```sh
npm run docs:deploy
```

## Testing

To run the tests, first clone the repository and install its dependencies :

```sh
git clone https://github.com/MM56/mm-movieclip.git
cd mm-movieclip
npm install
```

Then, run the tests :

```sh
npm test
```

To watch (test-driven development) :

```sh
npm run test:watch
```

For coverage :

```sh
npm run test:coverage
```