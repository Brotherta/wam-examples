import { WebAudioModule } from "./sdk/index.js";
import MyWamNode from "./wam-audio-player-node.js";

export default class MyWam extends WebAudioModule {
    async createAudioNode(initialState) {
        await MyWamNode.addModules(this.moduleId);
        const node = new MyWamNode(
            this,
            {
                processorOptions: {
                    numberOfInputs: 1,
                    numberOfOutputs: 1,
                    outputChannelCount: [2],
                    useSab: true
                }
            });


        console.log("coucou");
        node._initialize();
        return node;

    }

    async createGui() {
        const root = document.createElement('div');
        return root;
    }
}