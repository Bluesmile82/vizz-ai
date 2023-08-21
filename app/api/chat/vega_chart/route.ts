import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";
import schema from "./schema-v.3.0.0-beta.14.json";

import { createStructuredOutputChain } from "langchain/chains/openai_functions";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";
import { RunnableSequence } from "langchain/schema/runnable";
import { LLMChain } from "langchain/chains";

import { BytesOutputParser } from "langchain/schema/output_parser";

export const runtime = "edge";

// const TEMPLATE = `
// You must format your output as a JSON value that adheres to a given "JSON Schema" instance.
// "JSON Schema" is a declarative language that allows you to annotate and validate JSON documents.

// For example, the example "JSON Schema" instance {{"properties": {{"foo": {{"description": "a list of test words", "type": "array", "items": {{"type": "string"}}}}}}, "required": ["foo"]}}}}
// would match an object with one required property, "foo". The "type" property specifies "foo" must be an "array", and the "description" property semantically describes it as "a list of test words". The items within "foo" must be strings.
// Thus, the object {{"foo": ["bar", "baz"]}} is a well-formatted instance of this example "JSON Schema". The object {{"properties": {{"foo": ["bar", "baz"]}}}} is not well-formatted.

// Your output will be parsed and type-checked according to the provided schema instance, so make sure all fields in your output match the schema exactly and there are no trailing commas!

// Here is the JSON Schema instance your output must adhere to.
// \`\`\`json
// ${JSON.stringify(schema).replace(/{/g, "{{").replace(/}/g, "}}")}
// \`\`\`

// Create a Vega json from the input given by the user.

// Input:

// {input}`;

// For example, the example "JSON Schema" instance {{"properties": {{"foo": {{"description": "a list of test words", "type": "array", "items": {{"type": "string"}}}}}}, "required": ["foo"]}}}}
// would match an object with one required property, "foo". The "type" property specifies "foo" must be an "array", and the "description" property semantically describes it as "a list of test words". The items within "foo" must be strings.
// Thus, the object {{"foo": ["bar", "baz"]}} is a well-formatted instance of this example "JSON Schema". The object {{"properties": {{"foo": ["bar", "baz"]}}}} is not well-formatted.

const TEMPLATE = `
You must format your output as a JSON value that adheres to the Vega "JSON Schema" in https://vega.github.io/schema/vega/v5.json.
"JSON Schema" is a declarative language that allows you to annotate and validate JSON documents.

Display only the Vega JSON without any text before or after.

Create a Vega json from the input given by the user.

Input:

{input}`;

/**
 * This handler initializes and calls an OpenAI Functions powered
 * structured output chain. See the docs for more information:
 *
 * https://js.langchain.com/docs/modules/chains/popular/structured_output
 */

const openAIKey = process.env.OPENAI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    const currentMessageContent = messages[messages.length - 1].content;
    const prompt = PromptTemplate.fromTemplate<{ input: string }>(TEMPLATE);
    /**
     * Function calling is currently only supported with ChatOpenAI models
     */
    const model = new ChatOpenAI({
      temperature: 0.7,
      modelName: "gpt-3.5-turbo",
    });

    /**
     * You can pass JSON Schema directly using `createStructuredOutputChain()`
     */

    /**
     * Returns a specialized, preconfigured LLMChain.
     */
    // const chain = createStructuredOutputChain(schema, model, prompt);

    /**
     * Chat models stream message chunks rather than bytes, so this
     * output parser handles serialization and byte-encoding.
     */
    // const outputParser = new BytesOutputParser();

    // const chain = RunnableSequence.from([prompt, model]);
    // const chain = prompt.pipe(model).pipe(outputParser);

    // const input = await prompt.format({
    //   input: "currentMessageContent",
    // });

    const chain = new LLMChain({
      llm: model,
      prompt,
    });
    const response = await chain.run(currentMessageContent);

    // const result = await chain.invoke({ input: currentMessageContent });
    return NextResponse.json({ response, type: "vega" }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
