import {AzureKeyCredential, OpenAIClient, ChatRequestMessage} from "@azure/openai";

const openai = createOpenaiClient();

function createOpenaiClient() {
    try {
        return new OpenAIClient(
            "https://dataguild-openai.openai.azure.com/",
            new AzureKeyCredential(import.meta.env.VITE_OPENAI_API_KEY!),
            {
                apiVersion: "2023-07-01-preview",
            });
    } catch (error) {
        console.error("could not initialize gpt client: ", error)
    }
    return null;
}

export async function generateChatCompletion(messages: ChatRequestMessage[]) {
    if (!openai) {
        return null;
    }
    return await openai.getChatCompletions("deployment", messages);
}