<p align="center">
  <a href="https://example.com/">
    <img src="assets/images/wam-logo.png" alt="Logo" width=100 height=100>
  </a>

<h3 align="center">Web Audio Modules Examples</h3>

<p align="center">
Simple step-by-step example of web audio host. <br> 
It shows how to customize your audio processor with multiple workflow. <br>
Using JavaScript, C++ or Web Audio Modules.

<br>
<a href="https://www.webaudiomodules.org/">Web Audio Modules</a>
·
<a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API">Web Audio API</a>
·
<a href="https://emscripten.org/">Emscripten</a>
</p>


## Table of contents

- [About the Repository](#about-the-repository)
- [Getting Started](#getting-started)
- [Example 1](#example--simple-javascript-processor)
- [Example 2](#example--simple-c-processor)
- [Example 3](#example--simple-web-audio-module-processor)

## About The Repository

-- introduction to the repo...

## Getting Started

### Audio Source

To start with, all the examples below, uses the same audio source. 
To manipulate the audio buffer as we want, we transform the audio buffer source in a custom audio buffer, see [OperableAudioBuffer](./lib/utils/operable-audio-buffer.js).
This is not mandatory for the examples, but it's more convenient.

### Audio Node

In all the examples, we will use our own AudioNode. It is not mandatory to create a custom audio node.
However, for clarity reasons to keep index.js readable we create an Audio Node.

## Example : Simple JavaScript processor

This first example uses a simple audio worklet processor written in pure javascript.
We can customize the processor by using the Web Audio API.

### Audio Processor

The code of the processor is not particular in any manners. See the [AudioProcessor](example1-js/audio-player-processor.js).
The process function, copy the buffer source input to the output. For all the channels described in the processor.
The processor will handle the loop. At any moment of the process, we check if we arrived at the end of the buffer.

## Example : Simple C++ processor

There, we will see how to manipulate audio with C++. To start with, make sure to understand how the Web Assembly work.
See [Web Assembly Documentation](https://webassembly.org/getting-started/developers-guide/).
In this case we will use [Emscripten](https://emscripten.org/) to compile the C++ code into Web Assembly.

### C++ Function

We start with the simple C++ code that take a buffer source input and a buffer source output, and copy the input into the output.
Both the input and the output buffer are shared with the JavaScript. We will see how to initialise the buffers in JavaScript later.

```cpp
#include <emscripten.h>
#include <emscripten/bind.h>

using namespace emscripten;

/**
* Function to demonstrate how to use C++ code in javascript. This function is only copying the content of the input buffer,
* into the output buffer.
*/
extern "C" {

    int processPerf(uintptr_t input_ptr, uintptr_t output_ptr, int channel_count) {
        const unsigned kRenderQuantumFrames = 128;
        const unsigned kBytesPerChannel = kRenderQuantumFrames * sizeof(float);

        float *input_buffer = reinterpret_cast<float *>(input_ptr);
        float *output_buffer = reinterpret_cast<float *>(output_ptr);

        for (unsigned channel = 0; channel < channel_count; ++channel)
        {
            float *destination = output_buffer + (channel * kRenderQuantumFrames);
            float *source = input_buffer + (channel * kRenderQuantumFrames);
            memcpy(destination, source, kBytesPerChannel);
        }

        return 1;
    }

}
```

Care about defining the same `KRenderQuantumFrames` and the `kBytesPerChannel` in C++ and JavaScript.
Nothing particular about this code except that we work with pointers declared in JavaScript. 

### Compiling

To Compiles the C++ code, we used Emscripten. There we will use some options to keep only the .wasm.
We take in entry, the .cpp and Compile in a .wasm file. Before make sure to set up your Emscripten environment.
To understand all the compiling options, see [Emscripten Flags Settings](https://github.com/emscripten-core/emscripten/blob/main/src/settings.js).
Check the compiling process in the [Makefile](example2-js-cpp/Makefile).

### Fetch Web Assembly

In order to give to the processor, the web assembly module, we have to instantiate before creating the processor.
With the following lines :

```js
async function loadWasm() {
    WebAssembly.compileStreaming(fetch("./ProcessWasm.wasm"))
        .then(module => moduleWasm = module);
}
```

There `moduleWasm` is a global variable that we will give to the processor options.
When we create the audio node, we give to the processor through the processors options the Web Assembly module.

```js
const node = new AudioPlayerNode(audioCtx, 2, moduleWasm);
```

Then in the constructor of the audio node, we can share the module :

```js
constructor(context, channelCount, moduleWasm) {
    super(context, "audio-player-processor", {
        numberOfInputs: 0,
        numberOfOutputs: 2,
        channelCount,
        processorOptions: {
            moduleWasm
        }
    });
}
```

### Instantiate the Web Assembly Module

In the processor, you will have access to the module thanks to the processor options.
When you create the processor, you will have to instantiate the module, in order to use the C++ function.
There is multiple ways to do this, there, we use the method as following :

```javascript
setupWasm(options) {
    WebAssembly.instantiate(options.processorOptions.moduleWasm)
        .then(instance => {
            this.instance = instance.exports;
            this._processPerf = this.instance.processPerf;
            this.loadBuffers();
        })
        .catch(err => console.log(err));
}
```

Now thanks to the _processPerf property we can call the C++ code.

### Initialize the heaps

In order to share buffer between C++ and JavaScript, we will use Heap Audio Buffer, 
see [WebAudio SharedArrayBuffer](https://developer.chrome.com/blog/audio-worklet-design-pattern/#webaudio-powerhouse-audio-worklet-and-sharedarraybuffer) 
and the class [HeapAudioBufferInsideProcessor](example2-js-cpp/js/audio-player-processor.js)

On one hand, we have to create the output and input heaps :

```javascript

const BYTES_PER_SAMPLE = Float32Array.BYTES_PER_ELEMENT;

const MAX_CHANNEL_COUNT = 32;

const RENDER_QUANTUM_FRAMES = 128;

async loadBuffers() {
    this._heapInputBuffer = new HeapAudioBufferInsideProcessor(
        this.instance,
        RENDER_QUANTUM_FRAMES,
        2,
        MAX_CHANNEL_COUNT
    );
    this._heapOutputBuffer = new HeapAudioBufferInsideProcessor(
        this.instance,
        RENDER_QUANTUM_FRAMES,
        2,
        MAX_CHANNEL_COUNT
    );
}
```

Thanks to this two buffers we will use it to share the audio buffer source. 
And then during the process of the processor, we will use the C++ code :

```javascript
let returnCode = this._processPerf(
    this._heapInputBuffer.getHeapAddress(),
    this._heapOutputBuffer.getHeapAddress(),
    channelCount
);
```

## Example : Simple Web Audio Module processor

In this example, we will use the simple JavaScript processor, to facilitate the understanding of the code.
Before jumping into the code, be sure to check the [Web Audio Module API](https://github.com/webaudiomodules/wam-examples/wiki/SDK-Overview) first.

In order to create our processor with WAM standards, it requires to use the [SDK](https://github.com/webaudiomodules/sdk).

### Initialize the SDK

- [[source-code] >>](example3/index.js)

To work with WAM plugins, we need to keep the processor in the same group as the plugins.
By initializing the sdk we will get a unique host group id.

```js
const {default: initializeWamHost} = await import("./sdk/initializeWamHost.js");
const [hostGroupId] = await initializeWamHost(audioCtx);
```

This host group id will be used when initializing the host and the plugins as follows :

```javascript
const {default: MyWam} = await import("./my-wam.js");
const {default: WAM1} = await import(plugin1Url);
const {default: WAM2} = await import(plugin2Url);
```

### Creating Audio Node with WAM

In order to give our custom wam processor, we will create a class that extends WAM, to give access to the custom audio node.
See [MyWam](example3/my-wam.js).

Now that our host is initialized, we can create instances of the host and the plugins as follows.

```javascript
let wamInstance = await MyWam.createInstance(hostGroupId, audioCtx);
let pluginInstance1 = await WAM1.createInstance(hostGroupId, audioCtx);
let pluginInstance2 = await WAM2.createInstance(hostGroupId, audioCtx);
```

We have now access to the audio node with `wamInstance.audioNode`. It works as well for the plugins instance.

### WAM Processor

The WAM processor, is the same as the pure JavaScript apart from the registering method in the Audio Worklet.
In WAM the processor is registered in the GlobalScope of the Audio Worklet. To gives access to the options, 
you will need to define a function that return your processors as follows :

```javascript
const getProcessor = (moduleId) => {
    const audioWorkletGlobalScope = globalThis;
    const {registerProcessor} = audioWorkletGlobalScope;
    const ModuleScope = audioWorkletGlobalScope.webAudioModules.getModuleScope(moduleId);

    class MyWamProcessor extends ModuleScope.WamProcessor {
        // code of your processor goes here.
    }

    try {
        registerProcessor(moduleId, MyWamProcessor);
    } catch (error) {
        console.warn(error);
    }
    return MyWamProcessor;
}
export default getProcessor;
```
