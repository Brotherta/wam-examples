DEPS = ./cpp/processor-perf.cpp

OUTPUT_WASM = ./ProcessWasm.wasm

CC = emcc

FLAGS = --no-entry \
    -s WASM=1 \
    -s EXPORTED_FUNCTIONS=_processPerf \
    -s ALLOW_MEMORY_GROWTH=1 \
    -o $(OUTPUT_WASM) $(DEPS) \

build: $(DEPS)
	@$(CC) $(FLAGS)

clean:
	@rm -rf $(OUTPUT_WASM)
