import {AzureKeyCredential, OpenAIClient, ChatRequestMessage} from "@azure/openai";

const openai = new OpenAIClient(
    "https://dataguild-openai.openai.azure.com/",
    new AzureKeyCredential(import.meta.env.VITE_OPENAI_API_KEY!),
    {
        apiVersion: "2023-07-01-preview",
    }
);

export async function generateChatCompletion(messages: ChatRequestMessage[]) {
    return await openai.getChatCompletions("deployment", messages);
}