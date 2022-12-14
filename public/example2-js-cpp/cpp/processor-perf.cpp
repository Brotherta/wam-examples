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
// EMSCRIPTEN_BINDINGS(my_module) {
//     function("processPerf", &processPerf);
// }